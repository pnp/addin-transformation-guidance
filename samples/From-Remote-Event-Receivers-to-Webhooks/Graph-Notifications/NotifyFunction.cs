using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Security.Cryptography.X509Certificates;
using System.Threading.Tasks;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Azure.Functions.Worker;
using Microsoft.Azure.Functions.Worker.Http;
using Microsoft.Extensions.Logging;
using Microsoft.Graph;

namespace MSGraphSDKNotifications
{
    public static class NotifyFunction
    {
        [Function("Notify")]
        public static async Task<HttpResponseData> Run([HttpTrigger(AuthorizationLevel.Function, "post")] HttpRequestData req,
            FunctionContext executionContext)
        {
            // Prepare the response object
            HttpResponseData response = null;

            // Get the logger
            var log = executionContext.GetLogger("NotifyFunction");

            log.LogInformation("Notify function triggered!");

            // Graph Subscription validation logic, if needed
            var querystring = QueryHelpers.ParseQuery(req.Url.Query);
            string validationToken = null;
            if (querystring.ContainsKey("validationToken"))
            {
                validationToken = querystring["validationToken"];
            }
            if (!string.IsNullOrEmpty(validationToken))
            {
                response = req.CreateResponse(HttpStatusCode.OK);
                response.WriteString(validationToken);

                return response;
            }
            else
            {
                // Just output the body of the notification,
                // for the sake of understanding how Microsoft Graph notifications work
                using (var sr = new StreamReader(req.Body))
                {
                    log.LogInformation(sr.ReadToEnd());
                }
            }

            response = req.CreateResponse(HttpStatusCode.OK);

            return response;
        }
    }
}
