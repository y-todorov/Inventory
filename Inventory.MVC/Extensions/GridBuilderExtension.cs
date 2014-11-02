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

namespace Inventory.MVC.Extensions
{
    public static class GridBuilderExtension
    {
        // It is EXTREMELY important NOT to set the name here. This is because of details grids. There name MUST be  .Name("ProductInventoryViewModelGrid_#=ProductInventoryHeaderId#")
        public static GridBuilder<T> AddBaseOptions<T>(this GridBuilder<T> builder) where T : class
        {

            Type viewModelEntityType = typeof(T);
            string entityTypeName = viewModelEntityType.Name.Substring(0, viewModelEntityType.Name.IndexOf("ViewModel"));
            builder
                .Editable(e => e.DisplayDeleteConfirmation(true).Mode(GridEditMode.PopUp).Window(w => w.Title("Редакция")))
                .ColumnMenu(c => c.Enabled(true))
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
                .Sortable(ssb => ssb.AllowUnsort(true).Enabled(true).SortMode(GridSortMode.SingleColumn))
                .Filterable() // this is if And/Or is visible
                .Reorderable(r => r.Columns(true))
                .Resizable(resize => resize.Columns(true))




                .DataSource(dataSource => dataSource
                    .Ajax()
                    .Batch(false)
                    .Create(ControllerConstants.CreateCommandName, entityTypeName)
                    .Read(ControllerConstants.ReadCommandName, entityTypeName)
                    .Update(ControllerConstants.UpdateCommandName, entityTypeName)
                    .Destroy(ControllerConstants.DestroyCommandName, entityTypeName)
                    .PageSize(5)
                    .ServerOperation(false)
                    .Model(m =>
                    {
                        m.Id("Id");
                        m.Field("Id", typeof(long)).Editable(false);
                        m.Field("ModifiedOn", typeof(DateTime?)).Editable(false).DefaultValue(null);
                        m.Field("CreatedOn", typeof(DateTime?)).Editable(false).DefaultValue(null);

                    }
                    ));


            PropertyInfo[] modelEntityProperties = viewModelEntityType.GetProperties();

            InventoryContext testContext = new InventoryContext();

            builder
                .Columns(columns =>
                {
                    // за да е първо id-то
                    columns.Bound("Id"); // временно ги махам докато разбера как да са readonly е  Popup едит
                    foreach (PropertyInfo propertyInfo in modelEntityProperties)
                    {
                        RelationAttribute rellAttribute =
                             propertyInfo.GetCustomAttributes<RelationAttribute>().FirstOrDefault();
                        if (rellAttribute != null)
                        {
                            columns.ForeignKey(propertyInfo.Name,
                                testContext.Set(rellAttribute.EntityType).AsQueryable(), rellAttribute.DataValueField,
                                rellAttribute.DataTextField);
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
                            columns.Bound(propertyInfo.Name); //.Title(transaltedName);
                        }

                    }
                    columns.Command(command => { command.Edit().Text(string.Empty); command.Destroy().Text(string.Empty); });
                });

            builder.ToolBar(t =>
            {
                t.Create();
                //t.Save();
            }); // това е бъг, трябва да си е преведено

            return builder;
        }
    }
}