var hostweburl;
var appweburl;
var clientContext;
var hostweb; 
var documentsLibrary;
var docs;

// This code runs when the DOM is ready and creates a context object which is
// needed to use the SharePoint object model
$(document).ready(function () {
    hostweburl = decodeURIComponent(getQueryStringParameter("SPHostUrl"));
    appweburl = decodeURIComponent(getQueryStringParameter("SPAppWebUrl"));
    searchfilter = decodeURIComponent(getQueryStringParameter("SearchFilter"));

    clientContext = new SP.ClientContext.get_current();
    hostWebContext = new SP.AppContextSite(clientContext, hostweburl);
    hostweb = hostWebContext.get_web();
    listDocuments(searchfilter);
});

// This function retrieves the documents in the "Shared Documents" library of the parent site
function listDocuments(searchfilter) {
    documentsLibrary = hostweb.get_lists().getByTitle("Documents");
    if (searchfilter === undefined || searchfilter === '') {
        var camlQuery = SP.CamlQuery.createAllItemsQuery();
        docs = documentsLibrary.getItems(camlQuery);
    } else {
        var camlQuery = new SP.CamlQuery();
        var q = '<View><Query><Where><Contains><FieldRef ' +
            'Name="Title" /><Value Type="Text">' + searchfilter +
            '</Value></Contains></Where></Query></View>';
        camlQuery.set_viewXml(q); 

        docs = documentsLibrary.getItems(camlQuery);
    }

    clientContext.load(docs);
    clientContext.executeQueryAsync(onListDocumentsSucceded, onListDocumentsFailed);
}

// In case of successful retrieval of the docs
function onListDocumentsSucceded(sender, args) {
    $("#listDocuments").empty();

    if (docs.get_count() > 0) {
        var docsEnumerator = docs.getEnumerator();

        $("#listDocuments").append('<ul>');
        while (docsEnumerator.moveNext()) {
            var doc = docsEnumerator.get_current();

            var docId = doc.get_item("ID"); 
            var docServerRedirectedEmbedUri = doc.get_serverRedirectedEmbedUri(); 
            var docTitle = doc.get_item("Title");

            $("#listDocuments").append('<li><a href="' + docServerRedirectedEmbedUri + '">[' + docId + '] ' + docTitle + '</a></li>');
        }
        $("#listDocuments").append('</ul>');
    }
}

// In case of failed retrieval of the docs
function onListDocumentsFailed(sender, args) {
    alert('Request failed ' + args.get_message() + '\n' + args.get_stackTrace());
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