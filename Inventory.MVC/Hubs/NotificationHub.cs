//using Microsoft.AspNet.SignalR;
//using Microsoft.AspNet.SignalR.Hubs;

//namespace Inventory.MVC.Hubs
//{
//    [HubName("notificationHub")]
//    public class NotificationHub : Hub
//    {
//        public override System.Threading.Tasks.Task OnConnected()
//        {
//            Clients.All.notify("User Connected!");
//            return base.OnConnected();
//        }

//        public override System.Threading.Tasks.Task OnDisconnected(bool stopCalled)
//        {
//            Clients.All.notify("User Disconnected!");
//            return base.OnDisconnected(stopCalled);
//        }
        
//        public override System.Threading.Tasks.Task OnReconnected()
//        {
//            Clients.All.notify("User Reconnected!");
//            return base.OnReconnected();
//        }
        
//    }
//}