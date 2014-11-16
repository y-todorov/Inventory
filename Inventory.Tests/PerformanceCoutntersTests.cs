using Inventory.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xunit;

namespace Inventory.Tests
{
    public class PerformanceCoutntersTests
    {
        [Fact]
        public void TestPerfCounterCategory()
        {
            var processes = Process.GetProcesses();

            foreach (Process process in processes)
            {
                var res = PerformanceCounterUtils.GetPerformanceCountersForProcess("Process", process.ProcessName);
            }

            

           

        }

    }
}
