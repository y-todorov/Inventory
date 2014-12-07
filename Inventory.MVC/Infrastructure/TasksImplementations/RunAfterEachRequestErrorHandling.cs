using System;
using System.Diagnostics;
using System.Runtime.Caching;
using System.Threading;
using System.Web;
//using Inventory.MVC.Hubs;
using System.Web.Mvc;
using System.Web.Routing;
using Inventory.MVC.Infrastructure.Tasks;
using Microsoft.AspNet.SignalR;
using Inventory.MVC.Controllers;

namespace Inventory.MVC.Infrastructure.TasksImplementations
{
    public class RunAfterEachRequestErrorHandling : IRunAfterEachRequest
    {
        public void Execute()
        {
            if (HttpContext.Current != null)
            {
                if (HttpContext.Current.Response.StatusCode.ToString().StartsWith("4"))
                {
                    HttpContext.Current.Response.Clear();

                    var rd = new RouteData();
                    //rd.DataTokens["area"] = "AreaName"; // In case controller is in another area
                    rd.Values["controller"] = "Error";
                    rd.Values["action"] = "NotFound";
                    //Exception ex = HttpContext.Current.Server.GetLastError();
                    //rd.Values["model"] = ex;

                    IController c = new ErrorController();
                    c.Execute(new RequestContext(new HttpContextWrapper(HttpContext.Current), rd));
                }
            }
        }
    }
}