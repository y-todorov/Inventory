using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Inventory.Utils
{
    public static class PerformanceCounterUtils
    {
        public static IEnumerable<PerformanceCounter> GetPerformanceCounters(string categoryName)
        {
            PerformanceCounterCategory category = new PerformanceCounterCategory(categoryName);

            var performanceCounters = category.GetCounters();
            return performanceCounters;

            return performanceCounters;
        }

        public static IEnumerable<string> GetPerformanceCounterInstances(string categoryName)
        {
            PerformanceCounterCategory category = new PerformanceCounterCategory(categoryName);
            var instances = category.GetInstanceNames();
            return instances;
        }

        public static Dictionary<string, object> GetPerformanceCountersForProcess(string categoryName,
            string processName)
        {

            PerformanceCounterCategory category = new PerformanceCounterCategory(categoryName);

            var instances = category.GetCounters(processName);

            Dictionary<string, object> res = new Dictionary<string, object>();

            foreach (PerformanceCounter c in instances)
            {
                res.Add(c.CounterName, c.NextValue());
            }

            return res;
        }
    }
}
