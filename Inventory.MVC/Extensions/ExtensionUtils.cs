using Kendo.Mvc.UI.Fluent;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.Caching;
using System.Web;

namespace Inventory.MVC.Extensions
{
    public static class ExtensionUtils
    {
        public static TabStripBuilder GetCachedToolbar(TabStripBuilder factory)
        {
            var cached = MemoryCache.Default.Get("tabstrip") as TabStripBuilder;
            if (cached != null)
            {
                return cached;
            }
            else
            {

                var tsb = factory
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
                //string htmlString = tsb.ToHtmlString();
                MemoryCache.Default.Add("tabstrip", tsb, null);
                return tsb;
            }
        }
    }
}