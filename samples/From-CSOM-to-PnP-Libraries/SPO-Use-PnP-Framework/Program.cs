using Microsoft.SharePoint.Client;
using PnP.Framework;

var clientId = "<client-Id>";
var tenantId = "<tenant-Id>";
var redirectUrl = "http://localhost";
var siteUrl = "https://contoso.sharepoint.com/sites/TargetSite";

// Create an instance of the AuthenticationManager type
var authManager = AuthenticationManager.CreateWithInteractiveLogin(clientId, redirectUrl, tenantId);

// Get a reference to the ClientContext of CSOM
using (var context = await authManager.GetContextAsync(siteUrl))
{
    // Read web properties
    var web = context.Web;
    context.Load(web, w => w.Id, w => w.Title);
    await context.ExecuteQueryRetryAsync();

    Console.WriteLine($"{web.Id} - {web.Title}");

    // Retrieve a list by title together with selected properties
    var documents = web.GetListByTitle("Documents", l => l.Id, l => l.Title);

    Console.WriteLine($"{documents.Id} - {documents.Title}");

    // Retrieve the top 10 items from the list
    var query = CamlQuery.CreateAllItemsQuery(10);
    var items = documents.GetItems(query);
    context.Load(items);
    await context.ExecuteQueryRetryAsync();

    // Browse through all the items
    foreach (var i in items)
    {
        Console.WriteLine($"{i.Id} - {i["Title"]}");
    }     
}
