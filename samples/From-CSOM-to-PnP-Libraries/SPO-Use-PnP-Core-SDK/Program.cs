using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PnP.Core.Auth.Services.Builder.Configuration;
using PnP.Core.Services.Builder.Configuration;
using PnP.Core.Services;
using PnP.Core.QueryModel;

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

// Optionally create a DI scope
using (var scope = host.Services.CreateScope())
{
    // Obtain a PnP Context factory
    var pnpContextFactory = scope.ServiceProvider
        .GetRequiredService<IPnPContextFactory>();
    // Use the PnP Context factory to get a PnPContext for the given configuration
    using (var context = await pnpContextFactory.CreateAsync("SiteToWorkWith"))
    {
        // Retrieving web with lists and masterpageurl loaded ==> SharePoint REST query
        var web = await context.Web.GetAsync(p => p.Title, p => p.Lists,
        p => p.MasterUrl);

        // Output some information about the web
        Console.WriteLine($"{web.Id} - {web.Title}");

        // Browse through the requested lists
        foreach (var l in web.Lists.AsRequested())
        {
            Console.WriteLine($"{l.Id} - {l.Title}");
        }

        // Get a reference to the team connected to the current site, including the FunSettings
        var team = await context.Team.GetAsync(t => t.FunSettings);

        // Show one of the settings in the FunSettings property
        Console.WriteLine($"Are Giphy allowed? {team.FunSettings.AllowGiphy}");

        // Define a LINQ query to retrieve only the document libraries of the current web
        var lists = (from l in context.Web.Lists
                    where l.TemplateType == PnP.Core.Model.SharePoint.ListTemplateType.DocumentLibrary
                    select l);

        Console.WriteLine("=> Here are all the document libraries:");

        // Browse the lists resulting from the LINQ query
        foreach (var l in lists)
        {
            Console.WriteLine($"{l.Id} - {l.Title} - {l.TemplateType}");
        }
    }
}

// Cleanup console host
host.Dispose();
