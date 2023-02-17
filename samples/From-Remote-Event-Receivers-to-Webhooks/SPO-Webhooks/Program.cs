using System.Security.Cryptography.X509Certificates;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using PnP.Core.Auth.Services.Builder.Configuration;
using Microsoft.Extensions.Azure;

public class Program {
    public static void Main()
    {
        AzureFunctionSettings azureFunctionSettings = null;

        var host = new HostBuilder()
            .ConfigureServices((context, services) =>
            {
                // Add the Azure Storage services
                services.AddAzureClients(builder =>
                {
                    var blobConnectionString = context.Configuration["AzureStorage"];
                    builder.AddBlobServiceClient(blobConnectionString);
                    builder.AddQueueServiceClient(blobConnectionString);
                });

                // Add the global configuration instance
                services.AddSingleton(options =>
                {
                    var configuration = context.Configuration;
                    azureFunctionSettings = new AzureFunctionSettings();
                    configuration.Bind(azureFunctionSettings);
                    return configuration;
                });

                // Add our custom configuration instance
                services.AddSingleton(options => { return azureFunctionSettings; });

                // Add PnP Core SDK with default configuration
                services.AddPnPCore();

                // Configure default authentication provider for PnP Core SDK 
                services.AddPnPCoreAuthentication(options =>
                {
                    // Load the certificate to use
                    X509Certificate2 cert = LoadCertificate(azureFunctionSettings);

                    // Configure certificate based auth
                    options.Credentials.Configurations.Add("CertAuth", 
                        new PnPCoreAuthenticationCredentialConfigurationOptions
                        {
                            ClientId = azureFunctionSettings.ClientId,
                            TenantId = azureFunctionSettings.TenantId,
                            X509Certificate = new PnPCoreAuthenticationX509CertificateOptions
                            {
                                Certificate = LoadCertificate(azureFunctionSettings),
                            }
                        });

                    // Set the above authentication provider as the default one
                    options.Credentials.DefaultConfiguration = "CertAuth";
                });
            })
            .ConfigureFunctionsWorkerDefaults()
            .Build();

        host.Run();
    }

    private static X509Certificate2 LoadCertificate(AzureFunctionSettings azureFunctionSettings)
    {
        // Will only be populated correctly when running in the Azure Function host
        string certBase64Encoded = Environment.GetEnvironmentVariable("CertificateFromKeyVault");

        if (!string.IsNullOrEmpty(certBase64Encoded))
        {
            // Azure Function flow
            return new X509Certificate2(Convert.FromBase64String(certBase64Encoded),
                                        "",
                                        X509KeyStorageFlags.Exportable |
                                        X509KeyStorageFlags.MachineKeySet |
                                        X509KeyStorageFlags.EphemeralKeySet);
        }
        else
        {
            // Local flow
            var store = new X509Store(azureFunctionSettings.CertificateStoreName, azureFunctionSettings.CertificateStoreLocation);
            store.Open(OpenFlags.ReadOnly | OpenFlags.OpenExistingOnly);
            var certificateCollection = store.Certificates.Find(X509FindType.FindByThumbprint, azureFunctionSettings.CertificateThumbprint, false);
            store.Close();

            return certificateCollection.First();
        }
    }
}
