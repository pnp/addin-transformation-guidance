using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PnP.Core.Auth.Services.Builder.Configuration;
using PnP.Core.Services.Builder.Configuration;
using PnP.Core.Services;
using PnP.Core.QueryModel;

using Microsoft.SharePoint.Client;
using PnP.Framework;

var host = Host.CreateDefaultBuilder()
// Configure services with Dependency Injection
.ConfigureServices((hostingContext, services) =>
{
    // Add the PnP Core SDK library services
    services.AddPnPCore();
    // Add the PnP Core SDK library services configuration from the appsettings.json file
    services.Configure<PnPCoreOptions>(hostingContext
        .Configuration.GetSection("PnPCore"));
    // Add the PnP Core SDK Authentication Providers
    services.AddPnPCoreAuthentication();
    // Add the PnP Core SDK Authentication Providers 
    // configuration from the appsettings.json file
    services.Configure<PnPCoreAuthenticationOptions>(hostingContext
        .Configuration.GetSection("PnPCore"));
})
// Let the builder know we're running in a console
.UseConsoleLifetime()
// Add services to the container
.Build();

// Start console host
await host.StartAsync();

// ************************************************
// Use PnP Framework and switch to PnP Core SDK
// ************************************************

var clientId = "<client-Id>";
var tenantId = "<tenant-Id>";
var redirectUrl = "http://localhost";
var siteUrl = "https://contoso.sharepoint.com/sites/TargetSite";

// Create an instance of the AuthenticationManager type
var authManager = AuthenticationManager.CreateWithInteractiveLogin(clientId, redirectUrl, tenantId);

// Get a reference to the ClientContext of CSOM
using (var csomContext = await authManager.GetContextAsync(siteUrl))
{
    // Use CSOM to load the web title
    csomContext.Load(csomContext.Web, p => p.Title);
    csomContext.ExecuteQueryRetry();
    Console.WriteLine($"Title from PnP Framework: {csomContext.Web.Title}");

    using (PnPContext pnpCoreContext = PnPCoreSdk.Instance.GetPnPContext(csomContext))
    {
        // Use PnP Core SDK (Microsoft Graph / SPO Rest) to load the web title
        var web = await pnpCoreContext.Web.GetAsync(p => p.Title);

        Console.WriteLine($"Title from PnP Core SDK: {web.Title}");
    }
}

// ************************************************
// Use PnP Core SDK and switch to PnP Framework
// ************************************************

// Optionally create a DI scope
using (var scope = host.Services.CreateScope())
{
    // Obtain a PnP Context factory
    var pnpContextFactory = scope.ServiceProvider
        .GetRequiredService<IPnPContextFactory>();
    // Use the PnP Context factory to get a PnPContext for the given configuration
    using (var pnpCoreContext = await pnpContextFactory.CreateAsync("SiteToWorkWith"))
    {
        // Use PnP Core SDK (Microsoft Graph / SPO Rest) to load the web title
        var web = await pnpCoreContext.Web.GetAsync(p => p.Title);
        Console.WriteLine($"Title from PnP Core SDK: {web.Title}");

        using (ClientContext csomContext = PnPCoreSdk.Instance.GetClientContext(pnpCoreContext))
        {
            // Use CSOM to load the web title
            csomContext.Load(csomContext.Web, p => p.Title);
            csomContext.ExecuteQueryRetry();

            Console.WriteLine($"Title from PnP Framework: {csomContext.Web.Title}");
        }   
    }
}

// Cleanup console host
host.Dispose();
