using Microsoft.SharePoint.Client;
using Microsoft.SharePoint.Client.EventReceivers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SPO_Addin_Remote_Event_ReceiverWeb.Services
{
    public class NewContactEventReceiver : IRemoteEventService
    {
        /// <summary>
        /// Handles events that occur before an action occurs, such as when a user adds or deletes a list item.
        /// </summary>
        /// <param name="properties">Holds information about the remote event.</param>
        /// <returns>Holds information returned from the remote event.</returns>
        public SPRemoteEventResult ProcessEvent(SPRemoteEventProperties properties)
        {
            SPRemoteEventResult result = new SPRemoteEventResult();

            using (ClientContext clientContext = TokenHelper.CreateRemoteEventReceiverClientContext(properties))
            {
                if (clientContext != null)
                {
                    clientContext.Load(clientContext.Web);
                    clientContext.ExecuteQuery();

                    // Let's get a reference to the target item (just inserted)
                    var listId = properties.ItemEventProperties.ListId;
                    var listItemId = properties.ItemEventProperties.ListItemId;

                    // Get the actual list and item CSOM objects
                    var targetList = clientContext.Web.Lists.GetById(listId);
                    var targetItem = targetList.GetItemById(listItemId);

                    // Load the item
                    clientContext.Load(targetItem);
                    clientContext.ExecuteQuery();

                    // Now you can validate the target item ...
                    // Imagine whatever business logic you like

                    // And now set the result in order to continue the process
                    result.Status = SPRemoteEventServiceStatus.Continue;
                }
            }

            return result;
        }

        /// <summary>
        /// Handles events that occur after an action occurs, such as after a user adds an item to a list or deletes an item from a list.
        /// </summary>
        /// <param name="properties">Holds information about the remote event.</param>
        public void ProcessOneWayEvent(SPRemoteEventProperties properties)
        {
            using (ClientContext clientContext = TokenHelper.CreateRemoteEventReceiverClientContext(properties))
            {
                if (clientContext != null)
                {
                    clientContext.Load(clientContext.Web);
                    clientContext.ExecuteQuery();

                    // Let's get a reference to the target item (just inserted)
                    var listId = properties.ItemEventProperties.ListId;
                    var listItemId = properties.ItemEventProperties.ListItemId;

                    // Get the actual list and item CSOM objects
                    var targetList = clientContext.Web.Lists.GetById(listId);
                    var targetItem = targetList.GetItemById(listItemId);

                    // Load the item
                    clientContext.Load(targetItem);
                    clientContext.ExecuteQuery();

                    // Now you can process the target item ...
                }
            }
        }
    }
}
