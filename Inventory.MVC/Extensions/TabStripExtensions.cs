using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Web;
using Kendo.Mvc.UI;
using Kendo.Mvc.UI.Fluent;

namespace Inventory.MVC.Extensions
{
    public static class TabStripExtensions
    {
        public static TabStripBuilder AddMainItems(this TabStripBuilder builder)
        {
            var cached = MemoryCache.Default.Get("tabstrip") as TabStripBuilder;
            
            //if (cached != null)
            {
               // return cached;
            }
            //else
            {
                var tsb = builder
                    .Items(tabstrip =>
                    {
                        tabstrip.Add().Text("Клиенти")
                            .Action("Index", "Product");
                        tabstrip.Add().Text("Контакти")
                            .Action("Index", "Contact");
                        tabstrip.Add().Text("Потенциални клиенти")
                            .Action("Index", "Category");
                        tabstrip.Add().Text("Календари")
                            .Action("Index", "UnitMeasure");
                        tabstrip.Add().Text("Задачи")
                            .Action("Index", "Store");
                        tabstrip.Add().Text("Градове")
                            .Action("Index", "Town");
                        tabstrip.Add().Text("Региони")
                            .Action("Index", "Region");
                        tabstrip.Add().Text("Общини")
                            .Action("Index", "Municipality");
                        tabstrip.Add().Text("Индустрии")
                            .Action("Index", "Industry");
                        tabstrip.Add().Text("Документи")
                            .Action("Index", "Document");
                    }).SecurityTrimming(false);
                MemoryCache.Default.Add("tabstrip", tsb, null);
                return tsb;
            }
        }
    }
}