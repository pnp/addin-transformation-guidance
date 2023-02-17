using System.Net;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using PnP.Core.Model.SharePoint;
using PnP.Core.Services;
using Azure.Storage.Queues;

namespace PnP.SPO.Webhooks
{
    public class ProcessEvent
    {
        private readonly ILogger _logger;
        private readonly IPnPContextFactory _pnpContextFactory;
        private readonly AzureFunctionSettings _settings;
        private readonly QueueServiceClient _queueServiceClient;

        public ProcessEvent(IPnPContextFactory pnpContextFactory,
            AzureFunctionSettings settings,
            QueueServiceClient queueServiceClient,
            ILoggerFactory loggerFactory)
        {
            _pnpContextFactory = pnpContextFactory;
            _settings = settings;
            _queueServiceClient = queueServiceClient;
            _logger = loggerFactory.CreateLogger<ProcessEvent>();
        }

        [Function("ProcessEvent")]
        public async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Anonymous, "get", "post")] HttpRequestData req,
        string validationToken)
        {
            _logger.LogInformation("Webhook triggered!");
            
            // Prepare the response object
            HttpResponseData response = null;

            if (!string.IsNullOrEmpty(validationToken))
            {
                // If we've got a validationtoken querystring argument
                // We simply reply back with 200 (OK) and the echo of the validationtoken
                response = req.CreateResponse(HttpStatusCode.OK);
                response.Headers.Add("Content-Type", "text/plain; charset=utf-8");
                response.WriteString(validationToken);

                return response;
            }

            // Otherwise we need to process the event

            try 
            {
                // First of all, try to deserialize the request body
                using (var sr = new StreamReader(req.Body))
                {
                    var jsonRequest = sr.ReadToEnd();

                    var notifications = System.Text.Json.JsonSerializer.Deserialize<WebhookNotification>(jsonRequest, 
                        new System.Text.Json.JsonSerializerOptions {
                            PropertyNameCaseInsensitive = true
                        });

                    // If we have the input object
                    if (notifications != null)
                    {
                        // Then process every single event in the notification body
                        foreach (var notification in notifications.Value) 
                        {
                            var queue = _queueServiceClient.GetQueueClient("spo-webhooks");
                            if (await queue.ExistsAsync())
                            {
                                var message = System.Text.Json.JsonSerializer.Serialize(notification);
                                await queue.SendMessageAsync(
                                    System.Convert.ToBase64String(
                                        System.Text.Encoding.UTF8.GetBytes(message)));
                            }
                        }
                    }
                }                
            }
            catch (Exception ex)
            {
                _logger.LogError(ex.Message);
            } 

            // We need to return an OK response within 5 seconds
            response = req.CreateResponse(HttpStatusCode.OK);
            return response;
        }
    }
}
