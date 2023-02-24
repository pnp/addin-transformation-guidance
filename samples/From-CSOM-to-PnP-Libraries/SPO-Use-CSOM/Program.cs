using Microsoft.SharePoint.Client;
using Microsoft.Identity.Client;

var clientId = "<client-Id>";
var tenantId = "<tenant-Id>";
var authority = $"https://login.microsoftonline.com/{tenantId}/";
var redirectUri = "http://localhost";

var siteUrl = new Uri("https://contoso.sharepoint.com/sites/TargetSite");

var accessToken = await AcquireTokenAsync(siteUrl);

using (var context = new ClientContext(siteUrl))
{
    context.ExecutingWebRequest += async (sender, e) =>
    {
        // Insert the access token in the request
        e.WebRequestExecutor.RequestHeaders["Authorization"] = "Bearer " + accessToken;
    };

    // Read web properties
    var web = context.Web;
    context.Load(web, w => w.Id, w => w.Title);
    await context.ExecuteQueryAsync();

    Console.WriteLine($"{web.Id} - {web.Title}");

    // Retrieve a list by title together with selected properties
    var documents = web.Lists.GetByTitle("Documents");
    context.Load(documents, d => d.Id, d => d.Title);
    await context.ExecuteQueryAsync();

    Console.WriteLine($"{documents.Id} - {documents.Title}");

    // Retrieve the top 10 items from the list
    var query = CamlQuery.CreateAllItemsQuery(10);
    var items = documents.GetItems(query);
    context.Load(items);
    await context.ExecuteQueryAsync();

    // Browse through all the items
    foreach (var i in items)
    {
        Console.WriteLine($"{i.Id} - {i["Title"]}");
    }     
}

async Task<string> AcquireTokenAsync(Uri siteUrl)
{
    string resource = $"{siteUrl.Scheme}://{siteUrl.Authority}";

    var scopes = new String[] {$"{resource}/.default"};

    IPublicClientApplication publicClientApplication = PublicClientApplicationBuilder
                    .Create(clientId)
                    .WithTenantId(tenantId)
                    .WithAuthority(authority)
                    .WithRedirectUri(redirectUri)
                    .Build();

    AuthenticationResult tokenResult = null;

    // Try to see if we already have an account in the cache
    var account = await publicClientApplication.GetAccountsAsync().ConfigureAwait(false);
    try
    {
        // Try to get the token from the tokens cache
        tokenResult = await publicClientApplication.AcquireTokenSilent(scopes, account.FirstOrDefault())
            .ExecuteAsync().ConfigureAwait(false);
    }
    catch (MsalUiRequiredException)
    {
        // Try to get the token directly through AAD if it is not available in the tokens cache
        tokenResult = await publicClientApplication.AcquireTokenInteractive(scopes)
            .ExecuteAsync().ConfigureAwait(false);
    }

    return tokenResult != null ? tokenResult.AccessToken : null;
}
