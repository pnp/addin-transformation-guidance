# Upgrading your code from SharePoint JavaScript Object Model (JSOM) to PnPjs

While developing solutions with the SharePoint Add-in model you used to rely on the SharePoint JavaScript Object Model (JSOM) to consume SharePoint Online from client-side code. For example, you used to get a reference to the client context with the following syntax.

```JavaScript
var context = SP.ClientContext.get_current();
var user = context.get_web().get_currentUser();
```

Or you used to get the items of a library in a target SharePoint Online host site using the following syntax.

```JavaScript
// Get a reference to the current host web
var clientContext = SP.ClientContext.get_current();
var hostWebContext = new SP.AppContextSite(clientContext, hostweburl);
var hostweb = hostWebContext.get_web();

// Get a reference to the 'Documents' library
var list = hostweb.get_lists().getByTitle("Documents");

// Define a query to get all the items
var camlQuery = SP.CamlQuery.createAllItemsQuery();
var docs = documentsLibrary.getItems(camlQuery);

// Load and execute the actual query
clientContext.load(docs);
clientContext.executeQueryAsync(
    // Success callback
    function() {
        // Iterate through the items and display their titles
        var docsEnumerator = docs.getEnumerator();
        while (docsEnumerator.moveNext()) {
            var doc = docsEnumerator.get_current();
            console.log(doc.get_item('Title'));
        }
    },
    // Failure callback
    function(sender, args) {
        console.log('Request failed. ' + args.get_message() + '\n' + args.get_stackTrace());
    }
);
```

The above syntax is based on the JSOM (sp.js) and really tight to SharePoint Add-in model, in fact it relies on having the SharePoint tokens in the URL of a SharePoint-hosted site.

## Consuming SharePoint Online Data in SharePoint Framework
In the modern development model for SharePoint Online, the JSOM library is not anymore a suitable option and you should rely on SharePoint Online REST APIs or on Microsoft Graph APIs. For example, if you are developing a SharePoint Framework solution, you can rely on the *SPHttpClient* and on the *MSGraphClientV3* objects of the SPFx context to consume the SharePoint REST APIs or the Microsoft Graph APIs, respectively.

### Consuming SharePoint Online Data via *SPHttpClient*
For example, in the following code excerpt you can see how to consume the same list of documents of the above sample, while in SPFx via *SPHttpClient*.

```TypeScript
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './ConsumeSpoViaClientCodeWebPart.module.scss';

// Import spHttpClient
import { SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

// Define interface for each list item
export interface IListItem {
  Title?: string;
  Id: number;
}

// Define interface for list item collection
export interface ISPListItems {
  value: IListItem[];
}

export interface IConsumeSpoViaClientCodeWebPartProps {
}

export default class ConsumeSpoViaClientCodeWebPart extends BaseClientSideWebPart<IConsumeSpoViaClientCodeWebPartProps> {

  private _docs: ISPListItems;

  public render(): void {
    // For each document in the list, render a <li/> HTML element
    let docsOutput = '';
    this._docs.value.forEach(d => { docsOutput += `<li>${d.Title}</li>`; });
    this.domElement.innerHTML = `<div class="${ styles.consumeSpoViaClientCode }"><ul>${docsOutput}</ul></div>`;
  }

  protected async onInit(): Promise<void> {
    // Load all the documents onInit
    this._docs = await this._getDocuments();
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Get list items using spHttpClient
  private _getDocuments = async (): Promise<ISPListItems> => {
    // Get the REST response of the SharePoint REST API and return as collection of items
    return this.context.spHttpClient.get(this.context.pageContext.web.absoluteUrl + 
        `/_api/web/lists/GetByTitle('Documents')/items`, 
        SPHttpClient.configurations.v1)
      .then((response: SPHttpClientResponse) => {
        return response.json();
    });
  }
}
```

Notice that you don't have to rely on any querystring tokens or paramenters and you can simply query the *this.context.spHttpClient* to make an HTTP GET request to the SharePoint REST API for accessing the items of the 'Documents' document library. You can also use the same *this.context.spHttpClient* object to make a POST HTTP request or any other HTTP request via the *fetch* method. However, despite the code is quite simple and trivial, you need to be aware of the SharePoint REST API URL to invoke and about the JSON structure of the response, which in some scenarios and for non experienced SharePoint developers could be a challenge.

Nevertheless, using the same technique you can basically do whatever you need consuming SharePoint Online via REST.

> [!NOTE]
> You can dig into consuming SharePoint Online REST API in SharePoint Framework by reading the article [Connect to SharePoint APIs](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/connect-to-sharepoint).

### Consuming SharePoint Online Data via *MSGraphClient*
Another option that you have is to consume the SharePoint Online data using the Microsoft Graph API. Here you can find a simple code excerpt of a Web Part consuming the same list of documents but using Microsoft Graph and the *MSGraphClientV3* object. 

```TypeScript
import { Version } from '@microsoft/sp-core-library';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import styles from './ConsumeSpoViaGraphWebPart.module.scss';

import { MSGraphClientV3 } from '@microsoft/sp-http';

// Define interface for each list item
export interface IListItem {
  name?: string;
  id: number;
}

// Define interface for list item collection
export interface ISPListItems {
  value: IListItem[];
}

export interface IConsumeSpoViaGraphWebPartProps {
}

export default class ConsumeSpoViaGraphWebPart extends BaseClientSideWebPart<IConsumeSpoViaGraphWebPartProps> {

  private _docs: ISPListItems;

  public render(): void {
    // For each document in the list, render a <li/> HTML element
    let docsOutput = '';
    this._docs.value.forEach(d => { docsOutput += `<li>${d.name}</li>`; });
    this.domElement.innerHTML = `<div class="${ styles.consumeSpoViaGraph }"><ul>${docsOutput}</ul></div>`;
  }

  protected async onInit(): Promise<void> {
    // Load all the documents onInit
    this._docs = await this._getDocuments();
    return super.onInit();
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  // Get list items using spHttpClient
  private _getDocuments = async (): Promise<ISPListItems> => {
    // Get the REST response of the SharePoint REST API and return as collection of items
    const graphClient: MSGraphClientV3 = await this.context.msGraphClientFactory.getClient("3");
    return graphClient.api(`/sites/${this.context.pageContext.site.id}/drive/root/children`)
      .version('v1.0')
      .get();
  }
}
```

As like as with *SPHttpClient* the syntax is not too complex, and by knowning all the Microsoft Graph API endpoints and the structure of the JSON responses, you can easily consume any data in SharePoint Online or any other service in the Microsoft 365 ecosystem, as long as you will have proper permissions granted to your SharePoint Framework solution.

> [!NOTE]
> You can dig into consuming Microsoft Graph API in SharePoint Framework by reading the article [Use the MSGraphClientV3 to connect to Microsoft Graph](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-msgraph).

## Introducing the PnPjs Library
[PnPjs](https://pnp.github.io/pnpjs/) is an open source client-side library, implemented by the community for the community, that provides a collection of fluent libraries to consume SharePoint Online, Microsoft Graph, and Microsoft 365 REST APIs in a type-safe way.
You can use PnPjs in SharePoint Framework solutions, on in Node.js modules (like scripts, Azure Functions, etc.), on in any JavaScript or client-side based solution.

### Consuming SharePoint Online Data via PnPjs

### Using PnPjs in a Web Part

### Using PnPjs in a Service Class



## Recommended content 
You can find additional information about this topic reading the following documents:
* [PnPjs](https://pnp.github.io/pnpjs/)
* [PnPjs Getting Started](https://pnp.github.io/pnpjs/getting-started/)


[Go back to the index](./Readme.md)
