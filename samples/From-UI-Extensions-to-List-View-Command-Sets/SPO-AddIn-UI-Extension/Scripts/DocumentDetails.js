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