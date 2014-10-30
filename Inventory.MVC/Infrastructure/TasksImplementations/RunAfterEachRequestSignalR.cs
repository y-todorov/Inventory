using System;
using System.Diagnostics;
using System.Runtime.Caching;
using System.Threading;
using System.Web;
//using Inventory.MVC.Hubs;
using Inventory.MVC.Infrastructure.Tasks;
using Microsoft.AspNet.SignalR;

namespace Inventory.MVC.Infrastructure.TasksImplementations
{
    public class RunAfterEachRequestSignalR : IRunAfterEachRequest
    {
        public void Execute()
        {
            //if (HttpContext.Current != null)
            //{
            //    HttpRequest request = HttpContext.Current.Request;
            //    string key = request.RawUrl + Thread.CurrentThread.ManagedThreadId;
            //    var sw = MemoryCache.Default.Get(key) as Stopwatch;

            //    if (sw != null)
            //    {
            //        double mills = Math.Round(sw.Elapsed.TotalMilliseconds, 3);
            //        IHubContext context = GlobalHost.ConnectionManager.GetHubContext<NotificationHub>();

            //        string user = string.Empty;
            //        if (HttpContext.Current.User != null)
            //        {
            //            user = HttpContext.Current.User.Identity.Name;
            //        }

            //        string message = "User: " + user + ", Path: " + request.RawUrl + ", milliseconds: " + mills;

            //        context.Clients.All.notify(message);
            //        MemoryCache.Default.Remove(key);
            //    }
            //}
        }
    }
}