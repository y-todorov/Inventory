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
            const String categoryName = "Process";
            const String counterName = "ElapsedTimeSample";

            List<string> namesOfAll = new List<string>();

            PerformanceCounterCategory[] categories =
                System.Diagnostics.PerformanceCounterCategory.GetCategories();
            foreach (PerformanceCounterCategory category in categories)
            {
                if (category.CategoryType != PerformanceCounterCategoryType.SingleInstance)
                {
                    string[] names = category.GetInstanceNames();
                    foreach (string name in names)
                    {

                        try
                        {
                            foreach (var counter in category.GetCounters(name))
                            {
                                namesOfAll.Add(counter.CounterName);
                            }
                        }
                        catch (Exception ex)
                        {

                        }

                    }
                }
                else
                {
                    foreach (var counter in category.GetCounters())
                    {
                        namesOfAll.Add(counter.CounterName);
                    }
                }
            }


        }

    }
}
