using System;
using System.Collections;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;
using System.Resources;
using System.Web.Mvc;
using Inventory.MVC.Attributes;
using Inventory.MVC.Controllers;
using Kendo.Mvc.UI;
using Kendo.Mvc.UI.Fluent;
using Inventory.DAL;
using Inventory.MVC.Models;
using Inventory.MVC.Resources;
using System.Diagnostics;

namespace Inventory.MVC.Extensions
{
    public static class GridBuilderExtension
    {


        public static GridBuilder<T> ConfigureDataSource<T>(this GridBuilder<T> builder, DataSourceType dst, string entityTypeName) where T : class
        {
            builder.DataSource(dataSource =>
            {
                switch (dst)
                {
                    case DataSourceType.Custom:
                        dataSource
                            .SignalR().Schema(s => s.Model(m => m.Id("Id")))
                            .ServerAggregates(false)
                            .ServerFiltering(false)
                            .ServerGrouping(false)
                            .ServerPaging(false)
                            .ServerSorting(false)
                            .AutoSync(false)
                               .PageSize(10) // Това е важно! оправя Na / Na от 11 записа
                            .Events(events => events.Error("errorHandler")
                                .Push(@"
                                   function(e) {
                                   var notification = $(""#notification"").data(""kendoNotification"");
                                   notification.success(e.type);
                                   }
                               ")
                            )
                            .Batch(false)
                            .Transport(tr => tr
                                .Promise("hubStart")
                                .Hub("crudHub")
                                .Client(c => c
                                    .Read("read" + entityTypeName)
                                    .Create("create" + entityTypeName)
                                    .Update("update" + entityTypeName)
                                    .Destroy("destroy" + entityTypeName))
                                .Server(s => s
                                    .Read("read" + entityTypeName)
                                    .Create("create" + entityTypeName)
                                    .Update("update" + entityTypeName)
                                    .Destroy("destroy" + entityTypeName))
                            );
                        break;
                    case DataSourceType.Ajax:
                        dataSource
                            .Ajax()
                            .ServerOperation(false)
                            .AutoSync(false)
                               .PageSize(10) // Това е важно! оправя Na / Na от 11 записа
                            .Batch(false)
                            .Events(events => events.Error("errorHandler")
                                .Push(@"
                                   function(e) {
                                   var notification = $(""#notification"").data(""kendoNotification"");
                                   notification.success(e.type);
                                   }
                               ")
                            )
                            .Create("Create" + entityTypeName, entityTypeName)
                            .Read("Read" + entityTypeName, entityTypeName)
                            .Update("Update" + entityTypeName, entityTypeName)
                            .Destroy("Destroy" + entityTypeName, entityTypeName)
                            .Model(m => m.Id("Id"));
                        break;
                }



            });
            return builder;
        }

        // It is EXTREMELY important NOT to set the name here. This is because of details grids. There name MUST be  .Name("ProductInventoryViewModelGrid_#=ProductInventoryHeaderId#")
        public static GridBuilder<T> AddBaseOptions<T>(this GridBuilder<T> builder, DataSourceType dst = DataSourceType.Custom) where T : class
        {
            Stopwatch sw = Stopwatch.StartNew();

            Type viewModelEntityType = typeof(T);
            string entityTypeName = viewModelEntityType.Name.Substring(0, viewModelEntityType.Name.IndexOf("ViewModel"));
            builder
                .Editable(
                    e => e.DisplayDeleteConfirmation(true).Mode(GridEditMode.PopUp).Window(w => w.Title("Редакция")))
                .ColumnMenu(c => c.Enabled(true).Columns(false)) // Columns(true) е много глупаво, трябва да се направи от централизирано място а не от всяка колона
                
                .Groupable(
                    gsb =>
                        gsb.Enabled(true))
                .Pageable(
                    pb =>
                        pb.PageSizes(new[] { 5, 10, 100, 999 })
                            .Refresh(true)
                            .Info(true)
                            .Enabled(true)
                            .Input(true)
                            .ButtonCount(10)
                )
                // DateTime.Now.Ticks този код няма да сработи. Страницата просто се зарежда веднъж и повече не минава от тук колкото и да цъкаме експорт
                .Excel(excel => excel.AllPages(true).FileName("InventoryReport.xlsx").Filterable(true))
                // Не се превежда хубаво
                //.Pdf(pdf => pdf.FileName("InventoryReport.pdf").Date(DateTime.Now)
                //    .Author("InventoryAuthor").Subject("Inventory Subject Report").Title("Inventory Title").PaperSize("A3").Margin(0,0,0,0).Keywords("MVC REPORT INVENTORY"))
                .Sortable(ssb => ssb.AllowUnsort(true).Enabled(true).SortMode(GridSortMode.SingleColumn))
                .Filterable() // this is if And/Or is visible
                .Reorderable(r => r.Columns(true))
                .Resizable(c => c.Columns(true))
                .ColumnResizeHandleWidth(10)
                .ConfigureDataSource(dst, entityTypeName);
            //                .DataSource(dataSource => dataSource
            //                    .SignalR()
            //                    .AutoSync(false)
            //                    .PageSize(5) // Това е важно! оправя Na / Na от 11 записа
            //                    .Events(events => events.Error("errorHandler")
            //                        .Push(@"
            //                                   function(e) {
            //                                   var notification = $(""#notification"").data(""kendoNotification"");
            //                                   notification.success(e.type);
            //                                   }
            //                               ")
            //                                       )
            //                    .Batch(false)
            //                    .Transport(tr => tr
            //                        .Promise("hubStart")
            //                            .Hub("crudHub")
            //                        .Client(c => c
            //                            .Read("read" + entityTypeName)
            //                            .Create("create" + entityTypeName)
            //                            .Update("update" + entityTypeName)
            //                            .Destroy("destroy" + entityTypeName))
            //                        .Server(s => s
            //                            .Read("read" + entityTypeName)
            //                            .Create("create" + entityTypeName)
            //                            .Update("update" + entityTypeName)
            //                            .Destroy("destroy" + entityTypeName)))
            //                            .Schema(schema => schema
            //                    .Model(m =>
            //                    {
            //                        m.Id("Id");
            //                        m.Field("Id", typeof(long)).Editable(false);
            //                        m.Field("ModifiedOn", typeof(DateTime?)).Editable(false).DefaultValue(null);
            //                        m.Field("CreatedOn", typeof(DateTime?)).Editable(false).DefaultValue(null);

            //                    }
            //                    )));


            PropertyInfo[] modelEntityProperties = viewModelEntityType.GetProperties();

            InventoryContext testContext = new InventoryContext();
            // http://docs.telerik.com/kendo-ui/aspnet-mvc/helpers/grid/faq za limka na foreign key obektite @item
            builder
                .Columns(columns =>
                {

                    columns.Template(t => @"<text></text>")
             .Width(20)
             .HeaderTemplate("Действие")
                    .HeaderTemplate(@"<input type=""checkbox"" id=""checkboxHeader"" title=""Избери/Изчисти всички"" class=""k-checkbox checkbox"">
<label class=""k-checkbox-label"" title=""Избери/Изчисти всички"" for=""checkboxHeader""></label>")
                    .ClientTemplate(@"<input type=""checkbox"" id=""checkbox#=Id#""  title=""Избери/Изчисти"" class=""k-checkbox checkbox"">
<label class=""k-checkbox-label""  title=""Избери/Изчисти"" for=""checkbox#=Id#""></label>");

                    columns.Template(t =>  @"<text></text>")
             .Width(50)
             .HeaderTemplate("Действие")
//http://docs.telerik.com/kendo-ui/web/appearance-styling
                    .ClientTemplate(@"<a class=""k-button-icontext k-icon k-delete k-grid-delete"" href=""\#"" title=""Изтриване"">Изтриване</a> | 
<a class=""k-button-icontext k-icon  k-edit k-grid-edit"" href=""\#"" title=""Редактиране"">Редактиране</a>");

                    
            //        columns.Template(t => t)
            //.Width(50)
            //.ClientTemplate(@"<a class=""k-button-icontext k-icon  k-edit k-grid-edit"" href=""\#"">Редактиране</a>");
                    // за да е първо id-то
                    columns.Bound("Id"); // временно ги махам докато разбера как да са readonly е  Popup едит
                    foreach (PropertyInfo propertyInfo in modelEntityProperties)
                    {
                        if (propertyInfo.GetCustomAttributes<HiddenInputAttribute>().Any())
                        {
                            continue;
                        }
                        RelationAttribute rellAttribute =
                             propertyInfo.GetCustomAttributes<RelationAttribute>().FirstOrDefault();
                        if (rellAttribute != null)
                        {



                            columns.ForeignKey(propertyInfo.Name,
                                testContext.Set(rellAttribute.EntityType).AsQueryable(), rellAttribute.DataValueField,
                                rellAttribute.DataTextField);//.ClientTemplate("<a href=\"#:data."
                                //+ propertyInfo.Name + "#\">" + "#:data." + rellAttribute.PropertyNameInViewModel + ".Name" + "#  </a>").Locked(false).Lockable(true);
                            continue;
                        }

                        if (propertyInfo.Name == "Id")
                        {
                            continue;
                        }
                        if (propertyInfo.Name == "CreatedOn" ||
                            propertyInfo.Name == "ModifiedOn")
                        {
                            columns.Bound(propertyInfo.Name).Hidden().Format(ViewModelResources.DateTimeFormatString); // ebalo si e mamicata. poneje e hidden i ne se ose6ta za formata i go pokazva na angiiski
                            continue;
                        }
                        if (propertyInfo.Name == "CreatedBy" ||
                        propertyInfo.Name == "ModifiedBy")
                        {
                            columns.Bound(propertyInfo.Name).Hidden();
                            continue;
                        }
                        //else
                        {
                            columns.Bound(propertyInfo.Name).Locked(true).Lockable(true); //.Width("200px"); //.Title(transaltedName);
                        }
                     
                    } 
                   

                   
                    //columns.Command(command => { command.Edit(); //command.Destroy();
                    //});
                });

            builder.ToolBar(t =>
            {
                t.Template(@"Html.Kendo().ToolBar()
                          .Name(""ToolBar2"")
                          .Items(items =>
                          {
                              items.Add().Template(Html.Kendo().AutoComplete().Name(""autocom""));
                              
                          }))");

                t.Create();
                //t.Template(@"<a class=""k-button-icontext k-icon k-add k-grid-add"" href=""\#"">Добави</a>");
                t.Custom().Text("Редактиране");


                t.Custom().Text("Изтриване");
                t.Excel().Text("Експорт в Ексел");
                t.Pdf().Text("Експорт в Pdf");
                //t.Save();
            }); // това е бъг, трябва да си е преведено

            double mills = sw.Elapsed.TotalMilliseconds;
            Trace.WriteLine("AddBaseOptions completed in " + mills + " milliseconds.");

            return builder;
        }
    }
}