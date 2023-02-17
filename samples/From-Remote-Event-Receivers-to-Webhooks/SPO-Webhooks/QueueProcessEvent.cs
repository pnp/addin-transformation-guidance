using System;
using Azure.Storage.Blobs;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Extensions.Logging;
using PnP.Core.Model.SharePoint;
using PnP.Core.Services;

namespace PnP.SPO.Webhooks
{
    public class QueueProcessEvent
    {
        private readonly ILogger _logger;
        private readonly IPnPContextFactory _pnpContextFactory;
        private readonly AzureFunctionSettings _settings;
        private readonly BlobServiceClient _blobServiceClient;

        public QueueProcessEvent(IPnPContextFactory pnpContextFactory,
            AzureFunctionSettings settings,
            BlobServiceClient blobServiceClient,
            ILoggerFactory loggerFactory)
        {
            _pnpContextFactory = pnpContextFactory;
            _settings = settings;
            _blobServiceClient = blobServiceClient;
            _logger = loggerFactory.CreateLogger<QueueProcessEvent>();
        }

        [Function("QueueProcessEvent")]
        public async Task Run([QueueTrigger("spo-webhooks", Connection = "AzureStorage")] string queueMessage)
        {
            if (!string.IsNullOrEmpty(queueMessage))
            {
                var notification = System.Text.Json.JsonSerializer.Deserialize<WebhookNotificationEvent>(queueMessage, 
                    new System.Text.Json.JsonSerializerOptions {
                        PropertyNameCaseInsensitive = true
                    });
                
                if (notification != null)
                {
                    _logger.LogInformation($"Notification for resource {notification.Resource} on site {notification.SiteUrl} for tenant {notification.TenantId}");

                    using (var pnpContext = await _pnpContextFactory.CreateAsync(
                        new Uri($"https://{_settings.TenantName}/{notification.SiteUrl}"), 
                        CancellationToken.None))
                    {
                        pnpContext.GraphFirst = false;

                        // Define a query for the last 100 changes happened, regardless the type of change (add, update, delete). Here code still does not provide the ChangeToken 
                        var changeQuery = new PnP.Core.Model.SharePoint.ChangeQueryOptions(false, true) {
                            Item = true,                                   
                            FetchLimit = 100,
                        };

                        var lastChangeToken = await GetLatestChangeTokenAsync();
                        if (lastChangeToken != null) {
                            changeQuery.ChangeTokenStart = new ChangeTokenOptions(lastChangeToken);
                        }

                        // Use GetChanges against the list with ID notification.Resource, which is the target list
                        var targetList = pnpContext.Web.Lists.GetById(Guid.Parse(notification.Resource));
                        var changes = await targetList.GetChangesAsync(changeQuery);

                        // Save the last change token
                        await SaveLatestChangeTokenAsync(changes.Last().ChangeToken);

                        // Process all the retrieved changes
                        foreach (var change in changes)
                        {
                            _logger.LogInformation(change.GetType().FullName);

                            // Try to see if the current change is an IChangeItem
                            // meaning that it is a change that occurred on an item
                            if (change is IChangeItem changeItem)
                            {
                                // Get the date and time when the change happened
                                DateTime changeTime = changeItem.Time;
                                
                                // Check if we have the ID of the target item
                                if (changeItem.IsPropertyAvailable<IChangeItem>(i => i.ItemId))
                                {
                                    var itemId = changeItem.ItemId;

                                    // If that is the case, retrieve the item
                                    var targetItem = targetList.Items.GetById(itemId);

                                    if (targetItem != null)
                                    {
                                        // And log some information, just for the sake of making an example
                                        _logger.LogInformation($"Processing changes for item '{targetItem.Title}' happened on {changeTime}");
                                    }
                                }      
                            } 
                        }
                    }
                }
            }
        }

        private async Task<string> GetLatestChangeTokenAsync()
        {
            // Get a reference to the Azure Storage Container
            var container = _blobServiceClient.GetBlobContainerClient("spo-webhooks-storage");
            
            // Browse the files (there should be just one, if any)
            await foreach(var blob in container.GetBlobsAsync())
            {
                // If the file is the one we're looking for
                if (blob.Name == "ChangeToken.txt")
                {
                    // Get its actual content
                    var blobClient = container.GetBlobClient(blob.Name);
                    var blobContent = await blobClient.DownloadContentAsync();
                    var blobContentString = blobContent.Value.Content.ToString();
                    return blobContentString;
                }
            }

            // As a fallback, return null
            return null;
        }

        private async Task SaveLatestChangeTokenAsync(IChangeToken changeToken)
        {            
            // Get a reference to the Azure Storage Container
            var container = _blobServiceClient.GetBlobContainerClient("spo-webhooks-storage");

            // Get a reference to the Azure Storage Blob
            var blobClient = container.GetBlobClient("ChangeToken.txt");

            // Prepare the JSON content
            using (var mem = new MemoryStream())
            {
                using (var sw = new StreamWriter(mem))
                {
                    sw.WriteLine(changeToken.StringValue);
                    await sw.FlushAsync();
                    
                    mem.Position = 0;

                    // Upload it into the target blob
                    await blobClient.UploadAsync(mem, overwrite: true);
                }
            }
        }
    }
}
