using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.RazorPages;
using Microsoft.Identity.Web;
using Microsoft.SharePoint.Client;
using PnP.Framework;
using PnP.Framework.Utilities;

namespace AAD_Provider_Hosted_WebApp.Pages
{
    // Attribute required to have incremental consent
    [AuthorizeForScopes()]
    public class IndexModel : PageModel
    {
        private readonly ILogger<IndexModel> _logger;
        private readonly ITokenAcquisition _tokenAcquisition;
        private readonly IConfiguration _configuration;

        public List<Document> Documents { get; set; }

        public IndexModel(ILogger<IndexModel> logger,
            ITokenAcquisition tokenAcquisition,
            IConfiguration configuration)
        {
            _logger = logger;
            _tokenAcquisition = tokenAcquisition;
            _configuration = configuration;
        }

        public async Task OnGet()
        {
            await LoadSPODataAsync();
        }

        private async Task LoadSPODataAsync()
        {
            // Get the site URL from settings and determine the SPO tenant name
            var spoSiteUrl = _configuration["SPOSiteUrl"];
            var spoRootUrl = spoSiteUrl.Substring(0, spoSiteUrl.IndexOf("/", 9));

            // Get the access token for SPO
            var scopes = new[] { $"{spoRootUrl}/AllSites.Read" };
            var accessToken = await _tokenAcquisition.GetAccessTokenForUserAsync(scopes, user: HttpContext.User);
            var secureAccessToken = EncryptionUtility.ToSecureString(accessToken);

            // Build the secure ClientContext of CSOM via PnP Framework AuthenticationManager
            var am = AuthenticationManager.CreateWithAccessToken(secureAccessToken);
            using (var clientContext = am.GetContext(spoSiteUrl))
            {
                // User CSOM to retrieve files from the "Documents" document library
                var lib = clientContext.Web.Lists.GetByTitle("Documents");
                var docs = lib.GetItems(CamlQuery.CreateAllItemsQuery());

                clientContext.Load(docs);
                await clientContext.ExecuteQueryRetryAsync();

                // Map the documents to the Model
                this.Documents = new List<Document>();
                foreach (var d in docs)
                {
                    if (d["Title"] != null)
                    {
                        this.Documents.Add(new Document
                        {
                            Title = d["Title"]?.ToString(),
                            Link = $"{spoRootUrl}{d["FileRef"]?.ToString()}"
                        });
                    }
                }
            }
        }
    }
}

/// <summary>
/// Defines the model for a single Document item
/// </summary>
public record Document
{
    public string Title { get; set; }

    public string Link { get; set; }
}