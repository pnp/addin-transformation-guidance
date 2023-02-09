# From Status Bars, Notifications, and Dialogs to SPFx Application Customizers and Dialog Framework

In the SharePoint Add-in model you were used to rely on the JavaScript Object Model for SharePoint to show notifications, status bars, and dialog windows using syntax like the following:

```JavaScript
// Sample syntax to show and hide a notification area
var notifyId = SP.UI.Notify.addNotification('Notification message ...', true);
SP.UI.Notify.removeNotification(notifyId);

// Sample syntax to show and hide a status bar with red background color
var statusId = SP.UI.Status.addStatus('Status message ...');
SP.UI.Status.setStatusPriColor(this.statusId, 'red');
SP.UI.Status.removeStatus(statusId);

// Sample syntax to show a dialog window
var options = SP.UI.$create_DialogOptions();
options.url = '{SiteUrl}/_layouts/MyAddin/' + 'MyAddinDialog.aspx';
options.autoSize = true;
options.dialogReturnValueCallback = Function.createDelegate(null, dialogCloseCallback);
this.dialog = SP.UI.ModalDialog.showModalDialog(options);

// Function to handle dialog close callback
function dialogCloseCallback(result, returnValue) {
  if (result == SP.UI.DialogResult.OK) {
    window.alert('You clicked OK! And selected a status of: ' + returnValue);
  } else if (result == SP.UI.DialogResult.cancel) {
    window.alert('You clicked Cancel!');
  } 

  SP.UI.ModalDialog.RefreshPage(result);
}
```

Nowadays, with SharePoint Framework, you can rely on the Application Customizer extensions and to the SharePoint Framework Dialog Framework to achieve the same result and even more. In this article you can find detailed information about how to transform notifications, status bars, and dialog windows of the SharePoint Add-in model into SharePoint Framework modern solutions.

> [!NOTE]
> You can find further details about creating a SharePoint Framework Application Customizer by reading the documents [Build your first SharePoint Framework Extension (Hello World part 1)](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/build-a-hello-world-extension) and (Use page placeholders from Application Customizer (Hello World part 2))[https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/using-page-placeholder-with-extensions].

> [!NOTE]
> You can additional information about the SharePoint Framework Dialog Framework by reading the document [Use custom dialog boxes with SharePoint Framework Extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/using-custom-dialogs-with-spfx).

## Setting the context
Imagine that you need to provide a custom action in the UI of a Document Library in SharePoint Online and you want to show a dialog window to collect information from the user. Once the user provides the requested data, you want to inform her or him about the status of the process through a custom status bar. In order to achieve this result, you will need to create a List View Command Set and an Application Customizer.

A List ViewCommand Set is is a SharePoint Framework extension that allows you to create custom commands in the command bar or custom menu items in the ECB (Edit Control Block) menu of an item.
An Application Customizer is a SharePoint Framework extension that allows you to add a custom header and/or footer to a modern page, as well as it eventually allows you to embed custom client-side code in the modern pages of SharePoint Online.

> [!NOTE]
> You can learn how to create a List View Command Set by reading the document [Build your first ListView Command Set extension](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/get-started/building-simple-cmdset-with-dialog-api) and if you need to transform an already existing SharePoint Add-in model solution with a custom command into a modern SharePoint Framework solution, you can read the document (From UI Extensions to SharePoint Framework List View Command Sets)[./From-UI-Extensions-to-List-View-Command-Sets.md].

In the following screenshot, you can see how the custom dialog looks like in the modern UI of SharePoint Online.

![The UI of the dialog window in the modern UI of SharePoint Online.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-Dialog-output.png)

While in the following screenshot, you can see how an hypothetical footer looks like, when built leveraging a  SharePoint Framework Application Customizer, in order to implement a "Status Bar"-like experience.

![The UI of the footer in the modern UI of SharePoint Online.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-Footer-output.png)

## Creating a SharePoint Framework solution
In order to achieve the above result, let's start by creating a new SharePoint Framework solution.
First of all, you need to scaffold the SharePoint Framework solution, so start a command prompt or a terminal window, create a folder, and from within the newly created folder run the following command.

> [!IMPORTANT]
> In order to being able to follow the illustrated procedure, you need to have SharePoint Framework installed on your development environment. You can find detailed instructions about how to set up your environment reading the document [Set up your SharePoint Framework development environment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment).


```PowerShell
yo @microsoft/sharepoint
```

![The UI of the scaffolding tool in a PowerShell window, while creating a new project for a SharePoint Framework Application Customizer.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-yo-console.png)

Follow the prompts to scaffold a solution for a modern Application Customizer. Specifically, make the following choices, when prompted by the tool:
* What is your solution name? **spo-sp-fx-extensions**
* Which type of client-side component to create? **Extension**
* Which type of client-side extension to create? **Application Customizer**
* What is your Application Customizer name? **StatusBarHeader**

With the above answers, you decided to create a solution with name *spo-sp-fx-extensions*, in which there will be a custom extension of type Application Customizer with name *StatusBarHeader*.

Now, from whitin the same folder as before, run the scaffolding tool one more time. When you run the *@microsoft/sharepoint* generator multiple times against an already scaffolded solution, the tool will simply add the new generated code to the existing solution.

![The UI of the scaffolding tool in a PowerShell window, while creating a new project for a SharePoint Framework Application Customizer.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-yo-console-command.png)

Follow the prompts to scaffold an additional List View Command Set. Specifically, make the following choices, when prompted by the tool:
* Which type of client-side component to create? **Extension**
* Which type of client-side extension to create? **ListView Command Set**
* What is your Application Customizer name? **ProcessDocument**

With the above answers, you decided enrich the just scaffolded solution with a custom extension of type ListView Command Set with name *ProcessDocument*.

Now you have the SharePoint Framework solution ready to be customized. When it's done you can simply open the current folder using your favorite code editor. However, before opening the solution you will need to add a package to have an easy and better looking rendering of the UI of your extension. In fact, you are going to reference the MGT (Microsoft Graph Toolkit) library of components and the React framework by running the following commands:

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

![The outline of the SharePoint Framework generated solution.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-spfx-outline.png)

As you can see, under the *src/* folder there are two subfolders, one for the Application Customizer with name *statusBarFooter* and one for the ListView Command Set with name *processDocument*.

### Defining the ListView Command Set
Let's start by defining the ListView Command Set.
The main files scaffolded for this extension are the file *ProcessDocumentCommandSet.manifest.json* manifest and the *ProcessDocumentCommandSet.ts* with the actual TypeScript source code. In the manifest you define the general settings about the ListView Command Set, while in the TypeScript file you define the logic of the command.
In the following code excerpt you can see the content of the auto-generated manifest file:

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json",

  "id": "62d6fcda-986d-47fc-a162-b76a09aa95b9",
  "alias": "ProcessDocumentCommandSet",
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

Notice that it defines two different command items (*COMMAND_1* and *COMMAND_2*), which are defined by a title, an icon image URL, and a type. Keep an eye on the *id* attribute of the manifest, because you will use it to configure the provisioning of the extension. Moreover, in the following code excerpt, you can see how the real manifest of the solution should look like.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/command-set-extension-manifest.schema.json",

  "id": "62d6fcda-986d-47fc-a162-b76a09aa95b9",
  "alias": "ProcessDocumentCommandSet",
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
    "PROCESS_DOCUMENT": {
      "title": { "default": "Process" },
      "iconImageUrl": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFwAAABcCAYAAADj79JYAAAAA...X41EIr9WVVVVyviQtJt16W3+ByI+r3GhfPf7AAAAAElFTkSuQmCC",
      "type": "command"
    }
  }
}
```

In fact, in the actual implementation there is only one command with ID value of *PROCESS_DOCUMENT*, where the title is "Process" and the icon image URL is a data:image object with the Base64 encoded value of an image, which for the sake of simplicity has been simplified in the above excerpt.

Moreover, here follows the auto-generated TypeScript file defining the ListView Command Set.  

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
export interface IProcessDocumentCommandSetProperties {
  // This is an example; replace with your own properties
  sampleTextOne: string;
  sampleTextTwo: string;
}

const LOG_SOURCE: string = 'ProcessDocumentCommandSet';

export default class ProcessDocumentCommandSet extends BaseListViewCommandSet<IProcessDocumentCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ProcessDocumentCommandSet');

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

The code excerpt illustrated above shows the main code excerpts of the *ProcessDocumentCommandSet.ts* file.
First of all, you can notice that the Extension is declared as a TypeScript class with name *ProcessDocumentCommandSet*, which inherits from the base type `BaseListViewCommandSet<IProcessDocumentCommandSetProperties>`.
The *BaseListViewCommandSet* type is provided by the base libraries of SharePoint Framework, while the interface *IProcessDocumentCommandSetProperties* is defined just before the web part class declaration and it defines the configuration properties for your custom extension, if any.

In the *OnInit* method of the Extension, the code tries to retrieve a reference to a custom command extension with unique name of *COMMAND_1*. If the command exists, the code hides it as its initial status.

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

The values *COMMAND_1* and *COMMAND_2* referenced in the TypeScript file are those declared in the manifest file. That's why, in order to implement the actual solution, you will need to replace the auto-generated code with the following one.

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
export interface IProcessDocumentCommandSetProperties {
  // This is the hypothetical URL of a back-end service to invoke from the command logic 
  targetServiceUrl: string;
}

const LOG_SOURCE: string = 'ProcessDocumentCommandSet';

export default class ProcessDocumentCommandSet extends BaseListViewCommandSet<IProcessDocumentCommandSetProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, 'Initialized ProcessDocumentCommandSet');

    // initial state of the command's visibility
    const compareOneCommand: Command = this.tryGetCommand('PROCESS_DOCUMENT');
    compareOneCommand.visible = false;

    this.context.listView.listViewStateChangedEvent.add(this, this._onListViewStateChanged);

    return Promise.resolve();
  }

  public onExecute(event: IListViewCommandSetExecuteEventParameters): void {
    switch (event.itemId) {
      case 'PROCESS_DOCUMENT':
        Dialog.alert(`We should invoke the service with URL ${this.properties.targetServiceUrl}`).catch(() => {
          /* handle error */
        });
        break;
      default:
        throw new Error('Unknown command');
    }
  }

  private _onListViewStateChanged = (args: ListViewStateChangedEventArgs): void => {
    Log.info(LOG_SOURCE, 'List view state changed');

    const compareOneCommand: Command = this.tryGetCommand('PROCESS_DOCUMENT');
    if (compareOneCommand) {
      // This command should be hidden unless exactly one row is selected.
      compareOneCommand.visible = this.context.listView.selectedRows?.length === 1;
    }

    // You should call this.raiseOnChage() to update the command bar
    this.raiseOnChange();
  }
}
```

As you can see, the *COMMAND_1* value has been replaced by the actual *PROCESS_DOCUMENT* defined in the custom manifest. Moreover, the *IProcessDocumentCommandSetProperties* interface has been customized to provide an hypothetical property *targetServiceUrl* to define the URL of a back-end service.

> [!NOTE]
> This is just a sample solution, so you are not going to consume a real back-end API. However, in case you need to do so, you can learn how to consume an external API with SharePoint Framework by reading the document [Connect to Azure AD-secured APIs in SharePoint Framework solutions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/use-aadhttpclient).

So far, the *onExecute* method is just showing an alert with the configured URL for the back-end service. The actual value of the *targetServiceUrl* can be defined while provisioning the solution and you will learn how to do that near the end of this article.

Now, let's see the real implementation of the *onExecute* method, in order to show a dialog window to collect some input from the user. In order to do that, you can rely on the SharePoint Framework Dialog Framework, which is defined in package `@microsoft/sp-dialog`.

> [!NOTE]
> You can find further details about leveraging the SharePoint Framework Dialog Framework by reading the document [Use custom dialog boxes with SharePoint Framework Extensions](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/extensions/guidance/using-custom-dialogs-with-spfx).

In this sample, you are going to create a new custom dialog with a couple of input fields and two buttons, one to submit the  processing request and the other one to cancel and close the dialog. In the following picture you can see the UI of the dialog in action.

![The UI of the dialog window to start processing document in the modern UI of SharePoint Online.](./assets/From-Notifications-to-Application-Customizers/From-Notifications-to-Application-Customizers-Dialog-output-full.png)

To build such a dialog, first of all create a folder named *components* under the *src/extensions/processDocument* folder and then create yet another folder named *processDocumentDialog* under the *src/extensions/processDocument/components* folder. In the new *processDocumentDialog* folder add the following files:
* *IProcessDocumentDialogState.ts*: defines the state of the React component implementing the dialog
* *IProcessDocumentDialogProperties.ts*: defines the configuration properties of the React component implementing the dialog
* *ProcessDocumentDialog.tsx*: defines the actual implementation of the dialog React component

In the following code excerpt you can see the *IProcessDocumentDialogProperties.ts* file.

```TypeScript
export interface IProcessDocumentDialogProperties {
    tenantName: string;
    siteId: string;
    webId: string;
    driveId: string;
    itemId: string;
    onStartProcess: (description: string, dueDate: Date) => Promise<void>;
    onClose: () => Promise<void>;
}
```

The *IProcessDocumentDialogProperties* interface defines a set of properties to uniquely identify the selected document via Microsoft Graph (*tenantName*, *siteId*, *webId*, *driveId*, *itemId*). The interface also defines a callback method with name *onStartProcess* that will be invoked when the user selects to start the process and that receives as input arguments a *description* and a *dueDate* for the process to execute, plus another callback method with name *onClose*, which will simply handle the closing of the dialog without executing any further action.

Moreover, in the following code excerpt you can see the *IProcessDocumentDialogState.ts* file.

```TypeScript
export interface IProcessDocumentDialogState {
    description?: string;
    dueDate?: Date;
}
```

The *IProcessDocumentDialogState* interface defines the type used to hold the state of the dialog React component.

> [!NOTE]
> If you are new to React development you can learn more about React components by reading the document [React.Component](https://reactjs.org/docs/react-component.html).

The real dialog component is defined in the next code excerpt:

```TypeScript
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { IProcessDocumentDialogProperties } from './IProcessDocumentDialogProperties';
import { IProcessDocumentDialogState } from './IProcessDocumentDialogState';

import { BaseDialog, IDialogConfiguration } from '@microsoft/sp-dialog';
import {
    TextField,
    DatePicker,
    DayOfWeek,
    DefaultButton,
    PrimaryButton,
    DialogFooter,
    DialogContent
} from '@fluentui/react/lib';

import { File } from '@microsoft/mgt-react/dist/es6/spfx';
import { ViewType } from '@microsoft/mgt-react';

class ProcessDocumentDialogContent extends
    React.Component<IProcessDocumentDialogProperties, IProcessDocumentDialogState> {
    
    constructor(props: IProcessDocumentDialogProperties) {
        super(props);

        this.state = {
            description: '',
            dueDate: new Date()
        };
    }
    
    public render(): JSX.Element {
        return (<div>
            <DialogContent
                title="Process Document"
                onDismiss={this.props.onClose}>

            <div>
                <div>
                    <File siteId={`${this.props.tenantName},${this.props.siteId},${this.props.webId}`}
                        driveId={this.props.driveId} itemId={this.props.itemId}
                        view={ViewType.oneline} />
                </div>
                <div>
                    <TextField label="Process description"
                        onChange={this._onDescriptionChange}
                        value={this.state.description} />
                </div>
                <div>
                    <DatePicker label="Due date"
                        firstDayOfWeek={DayOfWeek.Monday}
                        placeholder="Select a due date..."
                        ariaLabel="Select a due date"
                        onSelectDate={this._onDueDateSelected}
                        value={this.state.dueDate} />
                </div>
            </div>

            <DialogFooter>
                <DefaultButton text="Cancel"
                        title="Cancel" onClick={this.props.onClose} />
                <PrimaryButton text="Start Process"
                        title="Start Process" onClick={async () => { await this.props.onStartProcess(this.state.description, this.state.dueDate); await this.props.onClose(); }} />
            </DialogFooter>
        </DialogContent>
      </div>);
    }

    private _onDescriptionChange = (event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, newValue?: string): void => {
        this.setState({ description: newValue });
    }

    private _onDueDateSelected = (date: Date): void => {
        this.setState({ dueDate: date });
    }
}

export default class ProcessDocumentDialog extends BaseDialog {

    /**
     * Constructor for the dialog window
     */
    constructor(public tenantName: string,
        public siteId: string, public webId: string,
        public driveId: string, public itemId: string,
        public onStartProcess: (description: string, dueDate: Date) => Promise<void>) {
        super({isBlocking: true});
    }
  
    public render(): void {
        ReactDOM.render(<ProcessDocumentDialogContent
                tenantName={this.tenantName}
                siteId={this.siteId}
                webId={this.webId}
                driveId={this.driveId}
                itemId={this.itemId}
                onStartProcess={this.onStartProcess}
                onClose={this._close}
            />,
            this.domElement);
    }
  
    public getConfig(): IDialogConfiguration {
      return {
        isBlocking: true
      };
    }
  
    private _close = async (): Promise<void> => {
        ReactDOM.unmountComponentAtNode(this.domElement);
        await this.close();
    }
}
```

The code file defines a *ProcessDocumentDialogContent* class, which represents an actual React component for rendering the content of the dialog window. The *render* method of the component simply renders a bunch of Fluent UI components to build an instance of the *DialogContent* component, with a group of *DIV* elements that stack the input fields and the buttons. The two input fields leverage the Fluent UI React components, in order to provide to the user an user experience that is consistent with the UX of Microsoft 365. 

> [!NOTE]
> Fluent UI is a collection of UX frameworks for creating good looking, cross-platform, and consistent user experiences that look like what Microsoft 365 native workloads look. If you want to learn more about Fluent UI, you can read the official documentation available at [Fluent UI](https://developer.microsoft.com/en-us/fluentui).

In the *ProcessDocumentDialog.tsx* file there is also the definition of another TypeScript class with name *ProcessDocumentDialog*, which inherits from `BaseDialog` of `@microsoft/sp-dialog` and which implements the actual dialog. In its render method the *ProcessDocumentDialog* class relies on the *ProcessDocumentDialogContent*.

Now that you've seen how the dialog windows is defined, you can also see the updated *onExecute* method in the *ProcessDocumentCommandSet.ts* file, to understand how you can create an instance of the dialog and how you can show it on the screen. In the following code excerpt you can see the updated *onExecute* method.

```TypeScript
public async onExecute(event: IListViewCommandSetExecuteEventParameters): Promise<void> {
  switch (event.itemId) {
    case 'PROCESS_DOCUMENT': {
      const tenantName: string = this.context.pageContext.site.absoluteUrl.substring(8,
        this.context.pageContext.site.absoluteUrl.indexOf('/', 8));
      const siteId: string = this.context.pageContext.site.id.toString();
      const webId: string = this.context.pageContext.web.id.toString();

      const spItemUrl: string = event.selectedRows[0].getValueByName(".spItemUrl");
      const driveId: string = spItemUrl.substring(spItemUrl.indexOf('drives/') + 7, spItemUrl.indexOf('items'));
      const itemId: string = spItemUrl.substring(spItemUrl.indexOf('items/') + 6, spItemUrl.indexOf('?'));

      const processDocumentDialog = new ProcessDocumentDialog(tenantName, siteId, webId, driveId, itemId, this._onStartProcess);
      await processDocumentDialog.show();

      break;
    }
    default:
      throw new Error('Unknown command');
  }
}
```

Notice that the method is now defined as an `async` method and its implementation creates a new instance of the *ProcessDocumentDialog* type, providing a bunch of arguments in the constructor, and then invoking the *show* method of the dialog. 

Once the dialog will be successfully close, by pressing the "Process Document" button, the execution flow will continue by executing the method *_onStartProcess* of the *ProcessDocumentCommandSet* type and which is illustrated in the following code excerpt.

```TypeScript
???
```

The only thing that is done by the *_onStartProcess* method is to notify to the Application Customizer the status of the process, so that the user can see it.

### Defining the Application Customizer
So now, let's dig into the Application Customizer implementation. First of all, let's have a look at the scaffolded code for the extension.

```TypeScript
import { Log } from '@microsoft/sp-core-library';
import {
  BaseApplicationCustomizer
} from '@microsoft/sp-application-base';
import { Dialog } from '@microsoft/sp-dialog';

import * as strings from 'StatusBarFooterApplicationCustomizerStrings';

const LOG_SOURCE: string = 'StatusBarFooterApplicationCustomizer';

/**
 * If your command set uses the ClientSideComponentProperties JSON input,
 * it will be deserialized into the BaseExtension.properties object.
 * You can define an interface to describe it.
 */
export interface IStatusBarFooterApplicationCustomizerProperties {
  // This is an example; replace with your own property
  testMessage: string;
}

/** A Custom Action which can be run during execution of a Client Side Application */
export default class StatusBarFooterApplicationCustomizer
  extends BaseApplicationCustomizer<IStatusBarFooterApplicationCustomizerProperties> {

  public onInit(): Promise<void> {
    Log.info(LOG_SOURCE, `Initialized ${strings.Title}`);

    let message: string = this.properties.testMessage;
    if (!message) {
      message = '(No properties were provided.)';
    }

    Dialog.alert(`Hello from ${strings.Title}:\n\n${message}`).catch(() => {
      /* handle error */
    });

    return Promise.resolve();
  }
}
```

There is the definition of a class *StatusBarFooterApplicationCustomizer* that inherits from `BaseApplicationCustomizer<IStatusBarFooterApplicationCustomizerProperties>`, where *IStatusBarFooterApplicationCustomizerProperties* - as like as it was with the ListView Command Set - defines the configuration properties for the extension.
In the *onInit* method of the Application Customizer you can implement your own logic to render the extension.

As like as it happens with a ListView Command Set, an Application Customizer does have a manifest file that defines the main settings for the extension. In the following code excerpt you can see the automatically scaffolded one for the extension.

```JSON
{
  "$schema": "https://developer.microsoft.com/json-schemas/spfx/client-side-extension-manifest.schema.json",

  "id": "4dca57ae-896c-48f9-b07b-4d2f3b952fbd",
  "alias": "StatusBarFooterApplicationCustomizer",
  "componentType": "Extension",
  "extensionType": "ApplicationCustomizer",

  // The "*" signifies that the version should be taken from the package.json
  "version": "*",
  "manifestVersion": 2,

  // If true, the component can only be installed on sites where Custom Script is allowed.
  // Components that allow authors to embed arbitrary script code should set this to true.
  // https://support.office.com/en-us/article/Turn-scripting-capabilities-on-or-off-1f2c515f-5d7e-448a-9fd7-835da935584f
  "requiresCustomScript": false
}
```

The only interesting and important part of the above manifest, in the context of the current article, is the *id* of the extension, which will become important during the provisioning and deployment of the solution.

As already discussed in this article, an Application Customizer is a SharePoint Framework extension that allows you to add a custom header and/or footer to a modern page, as well as it eventually allows you to embed custom client-side code in the modern pages of SharePoint Online.

In order to do that, you will need yet another React component that implements the rendering of the status bar. As such, create a folder named *components* under the *src/extensions/statusBarFooter* folder and then create yet another folder named *statusBar* under the *src/extensions/statusBarFooter/components* folder. In the new *statusBar* folder add the following files:
* *IStatusBarProperties.ts*: defines the state of the React component implementing the status bar
* *IStatusBarState.ts*: defines the configuration properties of the React component implementing the status bar
* *StatusBar.tsx*: defines the actual implementation of the status bar React component


In the current scenario, you are going to use a custom footer. In the following code excerpt you can see

### Configuring and provisioning the solution
Now, define the Application Customizer.

```XML
```
