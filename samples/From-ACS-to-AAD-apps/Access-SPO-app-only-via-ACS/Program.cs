using PnP.Framework;
using Microsoft.SharePoint.Client;
using Microsoft.Extensions.Configuration;
using System.Text;

// Create an instance of the Configuration Builder to read the appsettings.json file
IConfiguration config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json")
    .AddEnvironmentVariables()
    .AddUserSecrets<Settings>()
    .Build();

// Get values from the config and build an instance of the Settings class
var settings = config.GetRequiredSection("Settings").Get<Settings>();

// Use the PnP Framework AuthenticationManager class to get access to SharePoint Online
var am = new AuthenticationManager();

using (var context = am.GetACSAppOnlyContext(settings.SiteUrl, settings.ClientId, settings.ClientSecret))
{
    // Read the target library title
    var targetLibrary = context.Web.Lists.GetByTitle(settings.ListTitle);
    context.Load(targetLibrary, l => l.Title);
    await context.ExecuteQueryAsync();

    Console.WriteLine($"The title of the library is: \"{targetLibrary.Title}\"");

    // Add a new document to the target library
    using (var fileContent = new MemoryStream())
    {
        // Create some random text content
        var randomContent = Encoding.UTF8.GetBytes($"Some random content {DateTime.Now}");
        fileContent.Write(randomContent, 0, randomContent.Length);
        fileContent.Position = 0;

        // Upload the content as a random name file
        await targetLibrary.RootFolder.UploadFileAsync($"{Guid.NewGuid().ToString("n")}.txt", fileContent, true);
    }
}

class Settings
{
    public string SiteUrl { get; set; }
    public string ListTitle { get; set; }
    public string ClientId { get; set; }
    public string ClientSecret { get; set; }

}