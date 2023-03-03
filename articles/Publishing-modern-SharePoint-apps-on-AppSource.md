# Publishing modern SharePoint applications on Microsoft AppSource

In this article you will learn how to publish on the Microsoft 365 Store (aka [AppSource](https://appsource.microsoft.com/)) a modern solution built with SharePoint Framework. Your SharePoint Framework solution can target SharePoint Online only, or also Microsoft Teams. In the latter case, the application will show up in Microsoft Teams gallery through the SharePoint Online tenant App Catalog.

## How to publish an application on the marketplace
First of all, you need to make sure that you are a member of the Microsoft Partner Network (MPN). If you are not a registerd member, you can enroll through the following link: [https://aka.ms/joinmarketplace](https://aka.ms/joinmarketplace). In order to being able to sell your products on the marketplace, you will also need to provide a payout profile, a tax profile, and to compile the billing profile. The process will require a review and approval phase on the Microsoft side.

![The initial step of the Partner enrollment program. You need to provide your email address and follow the registration steps.](./assets/Publishing-modern-SharePoint-apps-on-AppSource/Publishing-modern-SharePoint-apps-on-AppSource-Partner-Center-01.png)

Then, you need to validate your application against the validation checklist, so that the app will pass the approval process. You can find the list of validation checks in the document [Prepare your SharePoint Framework application for publishing to the Marketplace](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-checklist).

In the checklist, just for the sake of making an example, you will find checks like:
- Use SharePoint Framework v1.11 or newer
- Test application in both root and non-root sites
- Test application in the required browsers
- The application must only manipulate the DOM element provided through the domElement property
- Don't use names of other Microsoft's products in your solution's name
- Supporting end users to inject scripts is not allowed
- Don't include malicious code
- etc.

Your application will go through a validation process, and it is better and time saving for you to validate all the checks before submitting your application. You should also make sure you read, review, and comply with the [Microsoft 365 policies for SharePoint Framework solutions](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies#1170-sharepoint-framework-solutions).

Once you are a registered partner, and once you have completed the onboarding process for the *"Office Store"* program, you should be able to find the *"Office Store"* program in your Partner Center dashboard, under [*"Account settings"* -> *"Programs"* -> *"Registered programs"*](https://partner.microsoft.com/en-us/dashboard/account/v3/settings/programs).

![The *"Registered programs"* section of the Microsoft *"Partner Center"* with the *"Office Store"* program subscribed and active.](./assets/Publishing-modern-SharePoint-apps-on-AppSource/Publishing-modern-SharePoint-apps-on-AppSource-Partner-Center-02.png)

You can now move to the [*"Marketplace"*](https://partner.microsoft.com/en-us/dashboard/marketplace-offers/overview) section of the *"Partner Center"* and from there you should choose to target the *"Office store"* and create a *"New offer"* of type *"SharePoint solution"*. Then, provide a name for your application, check that the name is unique and available, associate the product with a published and save it.

![](./assets/Publishing-modern-SharePoint-apps-on-AppSource/???.png)

Right after that, you will have to go through the product registration steps, which are the following ones:
- Product setup
- Packages
- Properties
- Marketplace settings
- Availability
- Additional certification info

Keep into account that while registering your product offering (the application) you should provide:
- Terms of use link
- Privacy Policy link
- Testing instructions for the reviewer
- Service or Account disclosures
- Additional Charge Disclousers for required Paid Services

Once you've gone through the offer registration process and your product will be validated, your offering will become ready and available on the marketplace.

## Recommended content 
You can find additional information about this topic reading the following documents:
* [Prepare your SharePoint Framework application for publishing to the Marketplace](https://learn.microsoft.com/en-us/sharepoint/dev/spfx/publish-to-marketplace-checklist)
* [Microsoft 365 policies for SharePoint Framework solutions](https://learn.microsoft.com/en-us/legal/marketplace/certification-policies#1170-sharepoint-framework-solutions)
* [Join the Microsoft Marketplace](https://aka.ms/joinmarketplace)
* [Microsoft Business Applications Independent Software Vendor (ISV) Connect Program onboarding guide](https://learn.microsoft.com/en-us/azure/marketplace/business-applications-isv-program)
* [Store step-by-step submission guide](https://learn.microsoft.com/en-us/azure/marketplace/add-in-submission-guide)



[Go back to the index](./Readme.md)
