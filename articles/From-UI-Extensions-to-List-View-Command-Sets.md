# From UI Extensions to SharePoint Framework List View Command Sets

In the SharePoint Add-in model you are used to extending the ribbon bar and the ECB (Edit Control Block) menu of lists view and libraries by creating UI Extensions. In the new SharePoint Framework you can achieve the same result by creating the so called List View Command Set.

In this article you can find detailed information about how to transform an already existing UI Extensions into a List View Command Set.

> [!NOTE]
> You can find further details about creating a SharePoint Framework List View Command Set by reading the document [Build your first ListView Command Set extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api).

## Transforming a UI Extension into a List View Command Set
Imagine that you have a UI Extension to render a custom button in the command bar of a Document Library, as well as to add a custom menu item to the ECB menu of the same library. Let's assume also that you want to show the button and the ECB menu item just for document libraries and if and only if just one document is selected by the user.
The UI Extension will show you a page with detailed information about the selected file.
In the following screeshot you can see the UI of the UI Extension built with the SharePoint Add-in model when extending the ECB menu of the currently selected document in the SharePoint classic UI.

![The UI of the UI Extension when extending the ECB menu.](./assets/From-UI-Extensions-to-List-View-Command-Sets/From-UI-Extension-to-List-View-Command-Set-ECB.png)

In the next screeshot you can see the UI of the UI Extension built with the SharePoint Add-in model when extending the ribbon of the document library in the SharePoint classic UI.

![The UI of the UI Extension when extending the ribbon menu.](./assets/From-UI-Extensions-to-List-View-Command-Sets/From-UI-Extension-to-List-View-Command-Set-ribbon.png)

Lastly, in the following screeshot you can see the actual UI of the UI Extension in action, when showing the details of the selected document.

![The UI of the UI Extension when rendering the details of a document.](./assets/From-UI-Extensions-to-List-View-Command-Sets/From-UI-Extension-to-List-View-Command-Set-legacy-output.png)

Now you want to transform the customization into a modern List View Command Set built with SharePoint Framework.

### The SharePoint Add-in model solution to migrate from
In the following code excerpt you can see the actual implementation of the UI Extensions built with javascript code.

```JavaScript
var hostweburl;
var appweburl;
var clientContext;
var hostweb;
var documentsLibrary;
var libraryId;
var itemId;

// This code runs when the DOM is ready and creates a context object which is
// needed to use the SharePoint object model
$(document).ready(function () {
    hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    libraryId = decodeURIComponent(getQueryStringParameter("SPListId"));
    itemId = decodeURIComponent(getQueryStringParameter("SPListItemId"));

    if (libraryId !== 'undefined' && itemId !== 'undefined') {
        var scriptbase = hostweburl + "/_layouts/15/";
        $.getScript(scriptbase + "SP.RequestExecutor.js", execCrossDomainRequest);
    }
});

// Make the actual request for the document using the cross-domain Request Executor
function execCrossDomainRequest() {

    var itemUri = appweburl +
        "/_api/SP.AppContextSite(@target)/web/lists/GetById('" + libraryId + "')/Items(" + itemId + ")?$select=ID,Title,Created,Modified,ServerRedirectedEmbedUrl&@target='" + hostweburl + "'";

    console.log(itemUri);

    var executor = new SP.RequestExecutor(appweburl);

    // First request, to retrieve the form digest 
    executor.executeAsync({
        url: itemUri,
        method: "GET",
        headers: { "Accept": "application/json; odata=verbose" },
        success: function (data) {
            var jsonObject = JSON.parse(data.body);
            console.log(jsonObject);
            var document = jsonObject.d;
            showDocumentDetails(document);
        },
        error: function (data, errorCode, errorMessage) {
            var errMsg = "Error retrieving the document details: " + errorMessage;
            $("#error").text(errMsg);
            $("#error").show();
        }
    });
}

// In case of successful retrieval of the document
function showDocumentDetails(document) {
    $("#document").empty();

    if (document !== undefined) {

        var docId = document.ID;
        var docTitle = document.Title;
        var docCreated = document.Created;
        var docModified = document.Modified;
        var docUrl = document.ServerRedirectedEmbedUrl;

        $("#document").append('<ul>');
        $("#document").append('<li><a href="' + docUrl + '">[' + docId + '] ' + docTitle + '</a></li>');
        $("#document").append('<li>Created on: ' + docCreated + '</li>');
        $("#document").append('<li>Modified on: ' + docModified + '</li>');
        $("#document").append('</ul>');
    }
}

function getQueryStringParameter(paramToRetrieve) {
    var params =
        document.URL.split("?")[1].split("&");
    var strParams = "";
    for (var i = 0; i < params.length; i = i + 1) {
        var singleParam = params[i].split("=");
        if (singleParam[0] == paramToRetrieve)
            return singleParam[1];
    }
}
```

As you can see the code is fully based on client-side code (JavaScript) and relies on the SharePoint JavaScript Object Model to retrieve a reference to the current app site, the from the app site it executes with the SP.RemoteExecutor model a REST API call to read the target document properties from the host site. Once the file properties are retrieved, the sample shows the basic document details through a dynamically generate set of HTML elements.

The UI Extension to render the ECB menu item is then defined in an XML element file, relying on the *CustomAction* element of the SharePoint Feature Framework, with the following syntax.

```xml
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
  <CustomAction Id="8d267eab-0cc9-4abf-88fd-25e320f1202f.ShowDocumentDetailsMenuItem"
                RegistrationType="List"
                RegistrationId="101"
                Location="EditControlBlock"
                Sequence="10001"
                Title="Document Details">
    <!-- 
    Update the Url below to the page you want the custom action to use.
    Start the URL with the token ~remoteAppUrl if the page is in the
    associated web project, use ~appWebUrl if page is in the app project.
    -->
    <UrlAction Url="~appWebUrl/Pages/Default.aspx?{StandardTokens}&amp;SPListItemId={ItemId}&amp;SPListId={ListId}" />
  </CustomAction>
</Elements>
```

You can see that the custom element declares that the extension targets lists of type 101 (i.e. Document Library) via the *RegistrationType* and *RegistrationId* attributes. It also declares that the *Location* of the custom action is the *EditControlBlock* of the target list or library.

Likewise, the custom ribbon command is defined with another XML element file, still relying on the *CustomAction* element of the SharePoint Feature Framework, with the following syntax.

```xml
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
  <CustomAction Id="f453c11a-3ee4-4247-b520-107b80c79892.ShowDocumentDetailsCommand"
                RegistrationType="List"
                RegistrationId="101"
                Location="CommandUI.Ribbon"
                Sequence="10001"
                Title="Invoke &apos;ShowDocumentDetailsCommand&apos; action">
    <CommandUIExtension>
      <!-- 
      Update the UI definitions below with the controls and the command actions
      that you want to enable for the custom action.
      -->
      <CommandUIDefinitions>
        <CommandUIDefinition Location="Ribbon.Documents.Manage.Controls._children">
          <Button Id="Ribbon.Documents.Manage.ShowDocumentDetailsCommandButton"
                  Alt="Document Details"
                  Sequence="100"
                  Command="Invoke_ShowDocumentDetailsCommandButtonRequest"
                  LabelText="Document Details"
                  TemplateAlias="o1"
                  Image32by32="_layouts/15/images/placeholder32x32.png"
                  Image16by16="_layouts/15/images/placeholder16x16.png" />
        </CommandUIDefinition>
      </CommandUIDefinitions>
      <CommandUIHandlers>
        <CommandUIHandler Command="Invoke_ShowDocumentDetailsCommandButtonRequest"
                          CommandAction="~appWebUrl/Pages/Default.aspx?{StandardTokens}&amp;SPListItemId={SelectedItemId}&amp;SPListId={SelectedListId}"/>
      </CommandUIHandlers>
    </CommandUIExtension >
  </CustomAction>
</Elements>
```

This last element file declares another custom action that still targets the document libraries (*RegistrationType* = 'List' and *RegistrationId* = 101) but now with a *Location* value of *CommandUI.Ribbon* and the definition of the ribbon command via the *CommandUIExtension* element.

In order to work, the SharePoint Add-in model solution requires the Read permission for libraries (BaseTemplate=101) defined in its *AppManifest.xml* file. In the following screeshot you can see the configuration of the AppManifest.xml file.

![The permissions requests configured for the SharePoint Add-in model solution. There is a permission for scope "List", with permission "Read", and with properties "BaseTemplate=101;".](./assets/From-UI-Extensions-to-List-View-Command-Sets/From-UI-Extension-to-List-View-Command-Set-app-manifest.png)

### Creating a SharePoint Framework solution
Now let's create a new SharePoint Framework solution that you will use to transform the previous SharePoint Add-in model solution.
First of all, you need to scaffold the SharePoint Framework solution, so start a command prompt or a terminal window, create a folder, and from within the newly created folder run the following command.

> [!IMPORTANT]
> In order to being able to follow the illustrated procedure, you need to have SharePoint Framework installed on your development environment. You can find detailed instructions about how to set up your environment reading the document [Set up your SharePoint Framework development environment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment).


```PowerShell
yo @microsoft/sharepoint
```

![The UI of the scaffolding tool in a PowerShell window, while creating a new project for a SharePoint Framework modern web part.](./assets/From-UI-Extensions-to-List-View-Command-Sets/From-UI-Extension-to-List-View-Command-Set-yo-console.png)

Follow the prompts to scaffold a solution for a modern List View Command Set. Specifically, make the following choices, when prompted by the tool:
* What is your solution name? **spo-sp-fx-list-view-command-set**
* Which type of client-side component to create? **Extension**
* Which type of client-side extension to create? **ListView Command Set**
* What is your Command Set name? **DocumentDetails**

With the above answers, you decided to create a solution with name *spo-sp-fx-list-view-command-set*, in which there will be a custom extension of type List View Command Set with name *DocumentDetails*.

The scaffolding tool will generate for you a new SharePoint Framework solution. When it's done you can simply open the current folder using your favorite code editor. However, before opening the solution you will need to add a package to have an easy and better looking rendering of the UI of your extension. In fact, you are going to reference the MGT (Microsoft Graph Toolkit) library of components and the React framework by running the following commands:

```PowerShell
npm install @microsoft/mgt-spfx @microsoft/mgt-react react@17.0.1 react-dom@17.0.1 --save
npm install @types/react@17.0.45 @types/react-dom@17.0.17 --save-dev
```

In fact, by default the scaffolded solution for a SharePoint Framework List View Command Set does not include the React packages, and it is up to you to choose to add them to the solution.

> [!NOTE]
> The Microsoft Graph Toolkit is a set of components to speed up the rendering of the UI of your client-side solutions, including SharePoint Framework solutions. It is not mandatory to use it in this sample solution, but it is an easy way to speed up your learning and development process. You can find detailed information about MGT reading the document [Microsoft Graph Toolkit overview](https://learn.microsoft.com/en-us/graph/toolkit/overview) and you can learn how to integrate MGT with SharePoint Framework reading the document [SharePoint Framework library for Microsoft Graph Toolkit](https://learn.microsoft.com/en-us/graph/toolkit/get-started/mgt-spfx).

Now you can open the solution in your favorite code editor. If your favorite code editor is Microsoft Visual Studio Code, simply run the following command:

```PowerShell
code .
```

In the following image, you can see the outline of the generated SharePoint Framework solution.

![The outline of the SharePoint Framework generated solution.](./assets/From-App-Parts-to-Modern-Web-Parts/From-App-Parts-to-Modern-Web-Parts-spfx-outline.png)

The main file, to start from is the *DocumentDetailsCommandSet.ts*, under the *src\extensions\documentDetails* folder. The file is based on TypeScript syntax, which is the one used by SharePoint Framework.

```TypeScript
import { Log } from '@microsoft/sp-core-library';
import {
  BaseListViewCommandSet,
  Command,
  IListViewCommandSetExecuteEventParameters,
  ListViewStateChangedEventArgs
} from '@microsoft/sp-listview-extensibility';
import { Dialog } from '@microsoft/sp-dialog';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IDocumentDetailsCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'DocumentDetailsCommandSet';

export default class DocumentDetailsCommandSet extends BaseListViewCommandSet<IDocumentDetailsCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized DocumentDetailsCommandSet');

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        Dialog.alert(`${this.properties.sampleTextOne}`).catch(() => {
          /* handle error */
        });
        break;
      case 'COMMAND_2':
        Dialog.alert(`${this.properties.sampleTextTwo}`).catch(() => {
          /* handle error */
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }
}
```

The code excerpt illustrated above shows the main code excerpts of the *DocumentDetailsCommandSet.ts* file.
First of all, you can notice that the Extension is declared as a TypeScript class with name *DocumentDetailsCommandSet*, which inherits from the base type `BaseListViewCommandSet<IDocumentDetailsCommandSetProperties>`.
The *BaseListViewCommandSet* type is provided by the base libraries of SharePoint Framework, while the interface *IDocumentDetailsCommandSetProperties* is defined just before the web part class declaration and it defines the configuration properties for your custom extension, if any.

In the *OnInit* method of the Extension the code tries to retrieve a reference to a custom command extension with unique name of *COMMAND_1*. If the command exists, the code hides it as its initial status.

```TypeScript
    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    compareOneCommand.visible = false;
```

Right after that, there is registration of an event handler that takes care of any view state change of the target list or library view.

```TypeScript
    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);
```

In case of any change in the current view, the event handler verifies if there is one and only one item or document selected. If that is the case, the code shows the command in the UI.

```TypeScript
  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('COMMAND_1');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // TODO: Add your logic here

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }
```

Lastly, the source code defines an *onExecute* method that provides the actual implementation of the extension.

```TypeScript
  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'COMMAND_1':
        Dialog.alert(`${this.properties.sampleTextOne}`).catch(() => {
          /* handle error */
        });
        break;
      case 'COMMAND_2':
        Dialog.alert(`${this.properties.sampleTextTwo}`).catch(() => {
          /* handle error */
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }
```

When the *onExecute* method is invoked, the *event.itemId* property defines the unique name of the command that got invoked by the user and you can implement your extension business logic accordingly. The auto-generated code simply show a dialog alert in the browser. 

You might be wondering where the *COMMAND_1* is declared in the extension code. It is actually defined in a manifest file called *DocumentDetailsCommandSet.manifest.json*, which is available in the same folder of the extension. In the following code excerpt, you can see the scaffolded manifest.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json",

  "id": "1602bb8e-cc1d-4417-ba7a-cc1b1d7d7022",
  "alias": "DocumentDetailsCommandSet",
  "componentType": "Extension",
  "extensionType": "ListViewCommandSet",

  // The "*" signifies that the version should be taken from the package.json
  "version": "*",
  "manifestVersion": 2,

  // If true, the component can only be installed on sites where Custom Script is allowed.
  // Components that allow authors to embed arbitrary script code should set this to true.
  // https://support.office.com/en-us/article/Turn-scripting-capabilities-on-or-off-1f2c515f-5d7e-448a-9fd7-835da935584f
  "requiresCustomScript": false,

  "items": {
    "COMMAND_1": {
      "title": { "default": "Command One" },
      "iconImageUrl": "icons/request.png",
      "type": "command"
    },
    "COMMAND_2": {
      "title": { "default": "Command Two" },
      "iconImageUrl": "icons/cancel.png",
      "type": "command"
    }
  }
}
```

As you can see, the initial part of the manifest declares that we are defining a component of type *Extension*, with an extension type of *ListViewCommandSet*. Moreover, the manifest also declares a unique *id* for the component, by using a GUID. Most importantly, there is a section called *items* where the actual commands are defined. In the scaffolded manifest you can see there are two commands (*COMMAND_1* and *COMMAND_2*) with the definition of their title, icon image URL, and type that is always *command*.

The last important file of the solution is the *elements.xml* file, defined under the *sharepoint\assets* folder of the solution. Here you can see the content of the auto-generated file:

```XML
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
    <CustomAction
        Title="DocumentDetails"
        RegistrationId="100"
        RegistrationType="List"
        Location="ClientSideExtension.ListViewCommandSet.CommandBar"
        ClientSideComponentId="1602bb8e-cc1d-4417-ba7a-cc1b1d7d7022"
        ClientSideComponentProperties="{&quot;sampleTextOne&quot;:&quot;One item is selected in the list.&quot;, &quot;sampleTextTwo&quot;:&quot;This command is always visible.&quot;}">
    </CustomAction>
</Elements>
```

Interestingly, it is still a file based on the SharePoint Feature Framework, like it was with the UI Extension built with the SharePoint Add-in model. However, the custom action settings are now slightly different. There are still attributes like *RegistrationId* and *RegistrationType* to define the targe of the extension. There is also the *Location* attribute with a new value that targets the *ClientSideExtension.ListViewCommandSet.CommandBar*, meaning that the extension will be rendered in the command bar of the target view. The available options for this attribute in a SharePoint Framework List View Command Set are:

* *ClientSideExtension.ListViewCommandSet.CommandBar*: to show the extension in the command bar.
* *ClientSideExtension.ListViewCommandSet.ContextMenu*: to show the extension in the ECB menu.
* *ClientSideExtension.ListViewCommandSet*: to show the extension in both the command bar and the ECB menu.

However, there are also a couple of new attributes:

* *ClientSideComponentId*: defines the unique ID of the extension to render, and maps to the *id* attribute defined in the manifest file that we discussed before.
* *ClientSideComponentProperties*: defines the custom configuration properties for the extension, if any. It is a string containing a JSON serialized object that represents an instance of the interface that declares the custom properties of the extension (in this example the interface is *IDocumentDetailsCommandSetProperties*).

### Building the actual SharePoint Framework List View Command Set
Now that you have an overview of the solution, let's build the actual List View Command Set to provide the document details, transforming the old SharePoint Add-in model UI Extension.

First of all, edit the manifest file and replace its content with the following one.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json",

  "id": "1602bb8e-cc1d-4417-ba7a-cc1b1d7d7022",
  "alias": "DocumentDetailsCommandSet",
  "componentType": "Extension",
  "extensionType": "ListViewCommandSet",

  // The "*" signifies that the version should be taken from the package.json
  "version": "*",
  "manifestVersion": 2,

  // If true, the component can only be installed on sites where Custom Script is allowed.
  // Components that allow authors to embed arbitrary script code should set this to true.
  // https://support.office.com/en-us/article/Turn-scripting-capabilities-on-or-off-1f2c515f-5d7e-448a-9fd7-835da935584f
  "requiresCustomScript": false,

  "items": {
    "DOC_DETAILS": {
      "title": { "default": "Document Details" },
      "iconImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAAA...AASUVORK5CYII=",
      "type": "command"
    }
  }
}
```

The updated manifest declares just one command, with unique name of *DOC_DETAILS*, with title 'Document Details', and with a custom icon image URL. Actually, the image is not a URL but a base64 encoded image, in order to not have any dependency on external files. For the sake of simplicity, in the code excerpt the base64 image is shortened.

Now, update the element file to show the List View Command Set both in the command bar and in the ECB menu, by providing a value of *ClientSideExtension.ListViewCommandSet* in the Location attribute. Plus, remove the content of the *ClientSideComponentProperties* attribute, because the sample extension doesn't need any custom properties. Here you can see the new element file.

```XML
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
    <CustomAction
        Title="DocumentDetails"
        RegistrationId="100"
        RegistrationType="List"
        Location="ClientSideExtension.ListViewCommandSet"
        ClientSideComponentId="1602bb8e-cc1d-4417-ba7a-cc1b1d7d7022"
        ClientSideComponentProperties="">
    </CustomAction>
</Elements>
```

It is now time to update the actual implementation of the List View Command Set by updating the *DocumentDetailsCommandSet.ts* file. First of all, replace the command unique name with the new one defined in the manifest. So, replace *COMMAND_1* with *DOC_DETAILS* in the *onInit*, *onExecute*, and *_onListViewStateChanged* methods and remove any logic related to the *COMMAND_2* extension, which does not exist anymore.

In the new SharePoint Framework implementation of the extension you will rely on the SharePoint Framework Dialog Framework to render a nice looking dialog window that will embed an MGT component to show detailed information about the selected file.

> [!NOTE]
> You can find further details about leveraging the SharePoint Framework Dialog Framework by reading the document [Use custom dialog boxes with SharePoint Framework Extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/using-custom-dialogs-with-spfx).

> [!NOTE]
> You can learn more about the *File* component of MGT by reading the document [File component in Microsoft Graph Toolkit](https://learn.microsoft.com/en-us/graph/toolkit/components/file).

In order to use the MGT component and the SPFx Dialog Framework, you need to import React into the extension code. Add the following lines of code at the beginning of the *DocumentDetailsCommandSet.ts* file.

```TypeScript
import * as React from 'react';
import * as ReactDom from 'react-dom';
```






























The property pane for configuring the properties of the web part is rendered thanks to the *getPropertyPaneConfiguration* method, which renders a field for each property. The rendering of the fields relies also on resource strings defined in external files declared within the SharePoint Framework solution, under the *src\webparts\listDocuments\loc* folder. The default language generated by the scaffolding tool is the US English one (en-us).

As such, if you want to provide the same documents filtering experince of the App Part, you can simply replace the interface definition with the following one:

```TypeScript
export interface IListDocumentsWebPartProps {
  searchFilter: string;
}
```

Then, you will also need to update the *getPropertyPaneConfiguration* method implementation, like in the following code excerpt:

```TypeScript
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('searchFilter', {
                  label: strings.SearchFilterFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
```

Notice that the `PropertyPaneTextField` object in the *groupFields* was updated to handle the new *searchFilter* property. There is also a new resource string for the label of the field, which was created in the file *src\webparts\listDocuments\loc\mystrings.d.ts* and whose value is configured in the resource file *src\webparts\listDocuments\loc\en-us.js*.

Another interesting part of the web part code is the *render* method, where the scaffolded solution simply creates an instance of a React component that is defined in the *src\webparts\listDocuments\components* folder. As you can see, the React component receives a set of properties as input arguments to configure its behavior. Since you replaced the *description* property in the *IListDocumentsWebPartProps* interface, you also need to update the render method accordingly, as you can see in the following code excerpt. Moreover, for the sake of being able to query the list of files using Microsoft Graph, the *render* method provides to the React component also the current Site ID, Web ID, and tenant name.

```TypeScript
public render(): void {
const element: React.ReactElement<IListDocumentsProps> = React.createElement(
    ListDocuments,
    {
    searchFilter: this.properties.searchFilter,
    tenantName: this.context.pageContext.site.absoluteUrl.substring(8,
        this.context.pageContext.site.absoluteUrl.indexOf('/', 8)),
    siteId: this.context.pageContext.site.id.toString(),
    webId: this.context.pageContext.web.id.toString(),
    isDarkTheme: this._isDarkTheme,
    environmentMessage: this._environmentMessage,
    hasTeamsContext: !!this.context.sdks.microsoftTeams,
    userDisplayName: this.context.pageContext.user.displayName
    }
);

ReactDom.render(element, this.domElement);
}
```

One more thing you need to do in your web part code is to initialize the MGT library. First of all, you will need to reference the MGT library in the code file, by adding the following line in the top section of the file, right after all the *import* statements.

```TypeScript
import { Providers, SharePointProvider } from '@microsoft/mgt-spfx';
```

Then, replace the *onInit* method of the web part with the following code excerpt.

```TypeScript
protected onInit(): Promise<void> {

if (!Providers.globalProvider) {
    Providers.globalProvider = new SharePointProvider(this.context);
}

return this._getEnvironmentMessage().then(message => {
    this._environmentMessage = message;
});
}
```

As you can see, the new *onInit* method relies on `Providers.globalProvider` to set an instance of the `SharePointProvider` of MGT that you referenced before. The result of the above syntax is that MGT will be initialized and ready to use the SharePoint Framework security context in order to consume Microsoft Graph. 

Now, in order to make your code to work, you will have to update the React component to support the new *searchFilter* property, as well as the *tenantName*, *siteId*, and *webId* properties. Open the *src\webparts\listDocuments\components\IListDocumentsProps.ts* file and replace the description property with the *searchFilter* one. Then add three new properties named *tenantName*, *siteId*, and *webId* like it is illustrated in the following code excerpt.

```TypeScript
export interface IListDocumentsProps {
  searchFilter: string;
  tenantName: string;
  siteId: string;
  webId: string;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
```

Now open the *src\webparts\listDocuments\components\ListDocuments.tsx* file, which represents the React component that will render the User Experience of the modern web part. Import the *FileList* component from the MGT library and update the *render* method in order to replace the *description* property with the new *searchFilter* one.

> [!NOTE]
> You can find further information about the *FileList* component by reading the document [File list component in Microsoft Graph Toolkit](https://learn.microsoft.com/en-us/graph/toolkit/components/file-list).

Lastly replace the whole return value of the render method, in order to show the value of the *searchFilter* property and the actual list of files using the *MgtFileList* component.

```TypeScript
import * as React from 'react';
import styles from './ListDocuments.module.scss';
import { IListDocumentsProps } from './IListDocumentsProps';
import { escape } from '@microsoft/sp-lodash-subset';
import { FileList } from '@microsoft/mgt-react/dist/es6/spfx';

export default class ListDocuments extends React.Component<IListDocumentsProps, {}> {
  public render(): React.ReactElement<IListDocumentsProps> {
    const {
      searchFilter,
      tenantName,
      siteId,
      webId,
      isDarkTheme,
      environmentMessage,
      hasTeamsContext,
      userDisplayName
    } = this.props;

    // If we have a value for searchFilter, let's use it, otherwise get the whole list of files
    const fileListQuery: string = searchFilter ?
      `/sites/${tenantName},${siteId},${webId}/drive/root/search(q='${escape(searchFilter)}')` :
      `/sites/${tenantName},${siteId},${webId}/drive/root/children`;

    return (
      <section className={`${styles.listDocuments} ${hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.welcome}>
          <img alt="" src={isDarkTheme ? require('../assets/welcome-dark.png') : require('../assets/welcome-light.png')} className={styles.welcomeImage} />
          <h2>Well done, {escape(userDisplayName)}!</h2>
          <div>{environmentMessage}</div>
          <div>Current search filter: <strong>{escape(searchFilter)}</strong></div>
        </div>
        <div>
          <FileList fileListQuery={fileListQuery} />
        </div>
      </section>
    );
  }
}
```

As you can see, the code dynamically builds the URL of a Microsoft Graph query to retrieve the list of files in the "Shared Documents" folder of the current site. In case there is a value for the *searchFilter* property, it relies on a search query. If there is no value for the *searchFilter* property it simply retrieves the whole list of files.
Then, inside the return statement of the *render* method there is an instance of the `FileList` React component of MGT, to render the actual list of files, providing the dynamic query as the value for the *fileListQuery* property.

As like as it was with the Add-in model App Part, also in SharePoint Framework you need to configure the permissions needed by your web part in order to consume the Microsoft Graph. You can do that by editing the */config/package-solution.json* file and creating a *WebApiPermissionRequests* section, like in the following code excerpt.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/package-solution.schema.json",
  "solution": {
    "name": "spo-sp-fx-web-part-client-side-solution",
    "id": "06b2a772-deaa-4b4b-855b-e50bd8e935f0",
    "version": "1.0.0.0",
    "includeClientSideAssets": true,
    "skipFeatureDeployment": true,
    "isDomainIsolated": false,
    "developer": {
      "name": "",
      "websiteUrl": "",
      "privacyUrl": "",
      "termsOfUseUrl": "",
      "mpnId": "Undefined-1.16.1"
    },
    "webApiPermissionRequests": [
      {
        "resource": "Microsoft Graph",
        "scope": "Files.Read"
      }
    ],
```

Once you are done with your changes, you can build the SharePoint Framework solution and run it in debug. In order to do that, you need to update the content of the */config/serve.json* file to target your actual SharePoint online site where you want to test the web part.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx-build/spfx-serve.schema.json",
  "port": 4321,
  "https": true,
  "initialPage": "https://enter-your-SharePoint-site/_layouts/workbench.aspx"
}
```

Replace the value of the *initialPage* property with the URL of your target site collection.
Then, you can simply run the following command in the terminal window:

```PowerShell
gulp serve
```

A browser window will start and you will see the SharePoint Framework Workbench, which is a page provided by SharePoint Online for debugging your SharePoint Framework components. Click the *Add* button and choose to add the custom *ListDocuments* web part to the page. 

![The UI of SharePoint Framework Workbench to test SharePoint Framework components. The image shows how to add a custom web part to the workbench.](./assets/From-App-Parts-to-Modern-Web-Parts/From-App-Parts-to-Modern-Web-Parts-workbench-add.png)

You will promptly see the following output.

![The UI of SharePoint Framework Workbench to test SharePoint Framework components. The image shows how to add a custom web part to the workbench.](./assets/From-App-Parts-to-Modern-Web-Parts/From-App-Parts-to-Modern-Web-Parts-workbench-output.png)

If you click on the pencil, just beside the web part, you will be able to show the property pane and to configure a search filter, which will be applied to the list of files rendered by the *FileList* control.