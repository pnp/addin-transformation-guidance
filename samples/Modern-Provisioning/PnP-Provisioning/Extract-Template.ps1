Connect-PnPOnline https://<tenant-name>.sharepoint.com/sites/<SourceSite>
Get-PnPSiteTemplate -Out .\template.xml -ListsToExtract "Customers" -Handlers Fields,ContentTypes,Lists

