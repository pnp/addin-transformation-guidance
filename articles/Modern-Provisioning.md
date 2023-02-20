# Understanding modern provisioning of artifacts

In classic SharePoint and with the SharePoint Add-in model you were used to provision artifacts in SharePoint using the SharePoint Feature Framework. In modern SharePoint, you can still rely on the SharePoint Feature Framework, inside a SharePoint Framework solution, saving your investments. However, you can also rely on other options like for example using PnP PowerShell and the PnP Provisioning Engine. 

In this article you can find detailed information about how to transform the provisioning of an already existing SharePoint Add-in Model based solution into a SharePoint Framework solution as well as how you can replace the SharePoint Feature Framework provisioning with the new and more powerfull PnP Provisioning Engine.

> [!NOTE]
> You can find further details about the SharePoint Feature Framework by reading the document [SharePoint Features schemas](https://learn.microsoft.com/en-us/sharepoint/dev/schema/sharepoint-features-schemas).

## The SharePoint Add-in model solution to migrate from
For example, imagine that you have a SharePoint Add-in model solution where you created a set of custom Site Columns and a custom Content Type that relies on those columns and that defines a Customer entity. In the following screenshot you can see how the solution looks like in Visual Studio.

![The outline of a SharePoint Add-in Model solution in Visual Studio. On the left, there is the Packaging Explorer to see what will be included in the deployment package. In the middle of the screen, there is the outline of a feature that will be provisioned onto the target site. On the right, there is the outline of the solution with three custom columns, one custom content type, and a custom list definition.](./assets/Modern-Provisioning/Modern-Provisioning-vs-addin-outline.png)

As you can see, in the solution there are three custom columns (*CustomerCode*, *CustomerEmail*, *CustomerType*), a custom content type (*Customer*), and a custom list (*Customers*) based on the custom content type and that will be part of the provisioning of a feature named *Feature1*.
In the following code excerpt you can see the definition of the custom columns and of the content type:

```XML
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">  
  <Field
       ID="{ac7f1666-9943-4cc4-81cf-90589dcdc26e}"
       Name="CustomerCode"
       DisplayName="Customer Code"
       Type="Text"
       Required="FALSE"
       Group="PnP Columns">
  </Field>

  <Field
       ID="{6dcb6494-aa2c-423c-9a77-2dafd95ee2ae}"
       Name="CustomerEmail"
       DisplayName="Customer Email"
       Type="Text"
       Required="FALSE"
       Group="PnP Columns">
  </Field>

  <Field
       ID="{f8818d0d-d464-4268-bff4-19b307616002}"
       Name="CustomerType"
       DisplayName="Customer Type"
       Type="Choice"
       Required="FALSE"
       Group="PnP Columns">
    <CHOICES>
      <CHOICE>Government</CHOICE>
      <CHOICE>Small Business</CHOICE>
      <CHOICE>Medium Business</CHOICE>
      <CHOICE>Enterprise</CHOICE>
      <CHOICE>Non-Profit</CHOICE>
    </CHOICES>
  </Field>

  <!-- Parent ContentType: Item (0x01) -->
  <ContentType ID="0x01006F716FA02F3F485BA83E3CE5BD9EB06A" Name="Customer" Group="PnP Content Types" Description="Custom content type to define a Customer item" Inherits="TRUE" Version="0">
    <FieldRefs>
      <FieldRef ID="{ac7f1666-9943-4cc4-81cf-90589dcdc26e}" DisplayName="Customer Code" Required="TRUE" Name="CustomerCode" />
      <FieldRef ID="{6dcb6494-aa2c-423c-9a77-2dafd95ee2ae}" DisplayName="Customer Email" Required="FALSE" Name="CustomerEmail" />
      <FieldRef ID="{f8818d0d-d464-4268-bff4-19b307616002}" DisplayName="Customer Type" Required="TRUE" Name="CustomerType" />
    </FieldRefs>
  </ContentType>
</Elements>
```

While in the following code excerpt you can see the definition of the custom list template for the list of Customers.

```XML
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
    <!-- Do not change the value of the Name attribute below. If it does not match the folder name of the List project item, an error will occur when the project is run. -->
    <ListTemplate
        Name="Customers"
        Type="100"
        BaseType="0"
        OnQuickLaunch="TRUE"
        SecurityBits="11"
        Sequence="410"
        DisplayName="Customers"
        Description="My List Definition"
        Image="/_layouts/15/images/itgen.png"/>
</Elements>
```

Lastly in the following code excerpt you can see the definition of a list instance of the custom list of customers.

```XML
<?xml version="1.0" encoding="utf-8"?>
<Elements xmlns="http://schemas.microsoft.com/sharepoint/">
  <ListInstance Title="Customers" OnQuickLaunch="TRUE" TemplateType="100" Url="Lists/Customers" Description="List of Customers"></ListInstance>
</Elements>
```

Inside Visual Studio, you also have a graphical designer that allows you to define the structure of the content type and of the list, as well as of the custom feature. 
Once you will deploy the SharePoint Add-in solution onto a target site collection, you will find the artifacts provisioned in the SharePoint-hosted site of the SharePoint Add-in.

The main limitations of the just described technique are the following ones:
* The artifacts are deployed in the SharePoint-hosted site and not in the actual site collection that you extended with your solution. In case you want to provisiong the artifacts in the actual site collection, you should rely on other techniques like remote provisioning (that we will cover later in this article).
* If you will remove the SharePoint Add-in solution from the target site, all the artifacts and the related content will be removed, too. You can eventually implement some custom logic, via SharePoint Remote Event Receivers, to preserve data, but it will be a not trivial effort.
* In case you need to do maintenance of your artifacts, you need to keep into account that the SharePoint Feature Framework was mainly designed for the initial provisioning, but it is not really good on maintaining the provisioned artifacts during the lifecycle of your solution.

## Provisioning artifacts with a SharePoint Framework
Now, let's move to the new SharePoint Framework and see how you can provision the same artifacts, but with a definitely better result.

First of all, you need to scaffold the SharePoint Framework solution, so start a command prompt or a terminal window, create a folder, and from within the newly created folder run the following command.

> [!IMPORTANT]
> In order to being able to follow the illustrated procedure, you need to have SharePoint Framework installed on your development environment. You can find detailed instructions about how to set up your environment reading the document [Set up your SharePoint Framework development environment](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/set-up-your-development-environment).


```PowerShell
yo @microsoft/sharepoint
```

![The UI of the scaffolding tool in a PowerShell window, while creating a new project for a SharePoint Framework modern web part.](./assets/Modern-Provisioning/Modern-Provisioning-yo-console.png)

Follow the prompts to scaffold a solution for a modern web part. Specifically, make the following choices, when prompted by the tool:
* What is your solution name? **spo-sp-fx-provisioning**
* Which type of client-side component to create? **WebPart**
* What is your Web part name? **ProvisioningSample**
* Which template would you like to use? **Minimal**

With the above answers, you decided to create a solution with name *spo-sp-fx-provisioning*, in which there will be a web part with name *ProvisioningSample* and that will be based on the Minimal template to render its User Experience. Basically, it will simply have a really minimal web part with JavaScript, HTML, and SCSS code.

The scaffolding tool will generate for you a new SharePoint Framework solution. When it's done you can simply open the current folder using your favorite code editor. If your favorite code editor is Microsoft Visual Studio Code, simply run the following command:

```PowerShell
code .
```



## Recommended content 
You can find additional information about this topic reading the following documents:
* []()


[Go back to the index](./Readme.md)
