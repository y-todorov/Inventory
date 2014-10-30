using System;
using System.Diagnostics;
using System.Runtime.Caching;
using System.Threading;
using System.Web;
using Inventory.MVC.Infrastructure.Tasks;

namespace Inventory.MVC.Infrastructure.TasksImplementations
{
    public class RunOnEachRequestSignalR : IRunOnEachRequest
    {
        public void Execute()
        {
            if (HttpContext.Current != null)
            {
                HttpRequest request = HttpContext.Current.Request;
                Stopwatch sw = Stopwatch.StartNew();

                string key = request.RawUrl + Thread.CurrentThread.ManagedThreadId;
                var ci = new CacheItem(key, sw);
                var cip = new CacheItemPolicy {AbsoluteExpiration = DateTimeOffset.Now.AddMinutes(1)};
                MemoryCache.Default.Add(ci, cip);
            }
        }
    }
}