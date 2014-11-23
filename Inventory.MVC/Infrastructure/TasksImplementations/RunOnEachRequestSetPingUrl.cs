using Inventory.MVC.Infrastructure.Tasks;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net.Http;
using System.Runtime.Caching;
using System.Timers;
using System.Web;

namespace Inventory.MVC.Infrastructure.TasksImplementations
{
    public class RunOnEachRequestSetPingUrl : IRunOnEachRequest
    {
        public void Execute()
        {
            //var pingUrl = MemoryCache.Default.Get("pingPage") as string;
            //if (string.IsNullOrEmpty(pingUrl))
            //{
            //    pingUrl = HttpContext.Current.Request.Url.Scheme + "://" + HttpContext.Current.Request.Url.Authority +
            //              HttpContext.Current.Request.ApplicationPath;//  + "/"+ "ping.html"; http://inventory-11.apphb.com
            //    MemoryCache.Default.Set("pingPage", pingUrl, null);
            //    Timer t = new Timer(1000);
            //    t.Elapsed += t_Elapsed;
            //    t.Start();
            //}
            
        }

        void t_Elapsed(object sender, ElapsedEventArgs e)
        {
            // var pingUrl = MemoryCache.Default.Get("pingPage") as string;
            //if (!string.IsNullOrEmpty(pingUrl))
            //{
            //    using (HttpClient hc = new HttpClient())
            //    {
            //        string res = hc.GetStringAsync(pingUrl).Result;
            //        Trace.WriteLine("Elapsed timer " + res);
            //    }
            //}

        }
    }
}