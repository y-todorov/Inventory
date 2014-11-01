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

namespace Inventory.MVC.Extensions
{
    public static class GridBuilderExtension
    {
        //public static GridBuilder<T> AddReadOnlyOptions<T>(this GridBuilder<T> builder, bool isClient = false)
        //    where T : class
        //{
        //    builder
        //        .AddBaseOptions()
        //        .Editable(editable => editable.Enabled(false))
        //        .AddToolbarOptions(false, false)
        //        .AddColumnOptions(isClient, false, false)
        //        .AddDataSourceOptions();

        //    return builder;
        //}

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
                        m.Field("CreatedOn", typeof(DateTime?)).Editable(false).DefaultValue(DateTime.Now); // Mnogo problemi s Model.IsValid 
                        //m.Field("CreatedBy", typeof(string)).Editable(false);
                        m.Field("ModifiedOn", typeof(DateTime?)).Editable(false).DefaultValue(DateTime.Now); // Mnogo problemi s Model.IsValid 
                        //m.Field("ModifiedBy", typeof(string)).Editable(false);

                        //m.Field("StoreId", typeof (long?));
                        //m.Field("CategoryId", typeof(long?));

                        //m.Field("UnitMeasureId", typeof(long?));


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

                            //IEnumerator enumerator =
                            //   testContext.Set(rellAttribute.EntityType).AsQueryable().GetEnumerator();
                            //List<dynamic> objects = new List<dynamic>();

                            //// THIS FIXES THE MANY QUERIES PROBLEM :) :) :)
                            //while (enumerator.MoveNext())
                            //{
                            //    objects.Add((dynamic)enumerator.Current);
                            //}

                            columns.ForeignKey(propertyInfo.Name,
                                testContext.Set(rellAttribute.EntityType).AsQueryable(), rellAttribute.DataValueField,
                                rellAttribute.DataTextField);

                            //var sel = objects.Select(o => new { Id = o.Id, Name = o.Name}).ToList();

                            //var test = testContext.Elements.OfType<ProductCategory>()
                            //    .Select(pc => new { value = pc.Id, text = pc.Name });

                //            columns.ForeignKey(propertyInfo.Name, new SelectList(new[]{
                //    new {text="t1",value = "1"},
                //    new {text="t2",value = "2"},
                //    new {text="t3",value = "3"},
                //}, "value", "text"));


                            //.EditorViewData(new {entityType=rellAttribute.EntityType}) ;

                            //        columns.ForeignKey(propertyInfo.Name,
                            //objects, rellAttribute.DataFieldValue, rellAttribute.DataFieldText)
                            continue;
                        }
                        // test
                        //if (propertyInfo.Name == "CategoryId")
                        //{
                        //    columns.ForeignKey(propertyInfo.Name,
                        //        testContext.Elements.OfType<ProductCategory>(), "Id", "Name");
                        //}

                        if (propertyInfo.Name == "Id")
                        {
                            continue;
                        }
                        if (propertyInfo.Name == "CreatedOn" ||
                            propertyInfo.Name == "CreatedBy")
                        {
                            //continue; // временно ги махам докато разбера как да са readonly е  Popup едит
                            columns.Bound(propertyInfo.Name).Visible(false);
                            continue;
                        }
                        if (propertyInfo.Name == "ModifiedOn" ||
                        propertyInfo.Name == "ModifiedBy")
                        {
                            columns.Bound(propertyInfo.Name).Visible(false);
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
                t.Create();//.Text("Добави");
                //t.Save();
            }); // това е бъг, трябва да си е преведено

            return builder;
        }

        private static string GetResourceString<T>(string s)
        {
            ResourceManager rm = new ResourceManager("Inventory.MVC.Resources.ViewModelResources", typeof(T).Assembly);
            string result = rm.GetString(typeof(T).Name + "_" + s);
            return result;
        }



        //public static GridBuilder<T> AddToolbarOptions<T>(this GridBuilder<T> builder, bool isCreateVisible = true,
        //    bool isSaveVisible = true) where T : class
        //{
        //    Type modelEntityType = typeof(T);
        //    PropertyInfo[] modelEntityProperties = modelEntityType.GetProperties();

        //    builder
        //        .ToolBar(toolbar =>
        //        {
        //            if (isCreateVisible)
        //            {
        //                toolbar.Create();
        //            }
        //            if (isSaveVisible)
        //            {
        //                toolbar.Save();
        //            }
        //            var dic = new Dictionary<string, object>();
        //            dic.Add("id", "exportToExcelLink");
        //            dic.Add("onclick", "exportGridData(this)");
        //            //string onclickHandler = "exportGridData(this)";


        //            toolbar.Custom()
        //                .Text("Export To Excel").HtmlAttributes(dic)
        //                .Action("DownloadExport", "Download", new { typeName = modelEntityType.Name });
        //        });
        //    return builder;
        //}

        //// Problems with aggregates in client mode !!!!!!!!!!!!
        //// When model is empty collection there are problems with aggregates!!!!!!!!!!!
        //public static GridBuilder<T> AddColumnOptions<T>(this GridBuilder<T> builder, bool isClient = false,
        //    bool isDeleteColumnVisible = true,
        //    bool isEditColumnVisible = true, bool isSelectColumnVisible = false, bool showHiddenColumns = false)
        //    where T : class
        //{
        //    Type modelEntityType = typeof(T);
        //    PropertyInfo[] modelEntityProperties = modelEntityType.GetProperties();

        //    builder
        //        .Columns(columns =>
        //        {
        //            foreach (PropertyInfo propertyInfo in modelEntityProperties)
        //            {
        //                RelationAttribute rellAttribute =
        //                    propertyInfo.GetCustomAttributes<RelationAttribute>().FirstOrDefault();
        //                if (rellAttribute != null)
        //                {
        //                    // DOES NOT WORK
        //                    //SelectList l = new SelectList(ContextFactory.Current.Set(rellAttribute.EntityType));

        //                    IEnumerator enumerator =
        //                        ContextFactory.Current.Set(rellAttribute.EntityType).AsQueryable().GetEnumerator();
        //                    List<object> objects = new List<object>();

        //                    // THIS FIXES THE MANY QUERIES PROBLEM :) :) :)
        //                    while (enumerator.MoveNext())
        //                    {
        //                        objects.Add(enumerator.Current);
        //                    }

        //                    // THIS MAKES LOTS OF QUERIES TO THE DB IF WE USE ContextFactory.Current.Set(rellAttribute.EntityType), DUNNO WHY
        //                    if (!isClient)
        //                    {
        //                        columns.ForeignKey(propertyInfo.Name,
        //                            objects, rellAttribute.DataFieldValue, rellAttribute.DataFieldText)
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                    }
        //                    else
        //                    {
        //                        columns.ForeignKey(propertyInfo.Name,
        //                            objects, rellAttribute.DataFieldValue, rellAttribute.DataFieldText)
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                "\\#"));
        //                    }
        //                }

        //                if (propertyInfo.GetCustomAttributes<KeyAttribute>().Any()) // The primary key
        //                {
        //                    if (!propertyInfo.GetCustomAttributes<HiddenInputAttribute>().Any() || (propertyInfo.GetCustomAttributes<HiddenInputAttribute>().Any() && showHiddenColumns))
        //                    {
        //                        if (!isClient)
        //                        {
        //                            columns.Bound(propertyInfo.Name).Title("Id") // propertyInfo.Name do not use this - it is too long for the UI
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                        }
        //                        else
        //                        {
        //                            columns.Bound(propertyInfo.Name).Title("Id")
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                    "\\#"));
        //                        }
        //                    }
        //                }
        //                // do not show foreign key columns
        //                if (propertyInfo.GetCustomAttributes<RelationAttribute>().Any() ||
        //                    propertyInfo.GetCustomAttributes<KeyAttribute>().Any() || // Just show the PK
        //                    (propertyInfo.GetCustomAttributes<HiddenInputAttribute>().Any() && !showHiddenColumns))
        //                {
        //                    continue;
        //                }

        //                string customFormat = string.Empty;
        //                DisplayFormatAttribute dfa =
        //                    propertyInfo.GetCustomAttributes<DisplayFormatAttribute>().FirstOrDefault();
        //                if (dfa != null && !string.IsNullOrEmpty(dfa.DataFormatString))
        //                {
        //                    customFormat = dfa.DataFormatString;
        //                }

        //                if (propertyInfo.PropertyType == typeof(bool) ||
        //                    propertyInfo.PropertyType == typeof(bool?))
        //                {
        //                    if (!isClient)
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                    }
        //                    else
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                "\\#"));
        //                    }
        //                }
        //                if (propertyInfo.PropertyType == typeof(string))
        //                {
        //                    GridBoundColumnBuilder<T> bldr = columns.Bound(propertyInfo.Name);
        //                    if (propertyInfo.Name.Equals("ModifiedByUser", StringComparison.InvariantCultureIgnoreCase))
        //                    {
        //                        bldr = bldr.Title("Mdf. By User");
        //                    }

        //                    if (!isClient)
        //                    {
        //                        bldr
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                    }
        //                    else
        //                    {
        //                        bldr
        //                            .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                "\\#"));
        //                    }
        //                }
        //                if (propertyInfo.PropertyType == typeof(double) ||
        //                    propertyInfo.PropertyType == typeof(double?))
        //                {
        //                    if (!isClient)
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:N3}")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:N3}', sum)#")
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:N3}', sum)#");
        //                    }
        //                    else
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:N3}")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:N3}', sum)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:N3}', sum)#".Replace("#", "\\#"));
        //                    }
        //                }
        //                if (propertyInfo.PropertyType == typeof(decimal) ||
        //                    propertyInfo.PropertyType == typeof(decimal?))
        //                {
        //                    if (!isClient)
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:C3}")
        //                            .EditorTemplateName("Currency")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:C3}', sum)#")
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:C3}', sum)#");
        //                    }
        //                    else
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:C3}")
        //                            .EditorTemplateName("Currency")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:C3}', sum)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:C3}', sum)#".Replace("#", "\\#"));
        //                    }
        //                }
        //                if (propertyInfo.PropertyType == typeof(int) ||
        //                    propertyInfo.PropertyType == typeof(int?))
        //                {
        //                    if (!isClient)
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:N}")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:N}', sum)#")
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:N}', sum)#");
        //                    }
        //                    else
        //                    {
        //                        columns.Bound(propertyInfo.Name)
        //                            .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:N}")
        //                            .ClientFooterTemplate("Σ: #= kendo.format('{0:N}', sum)#".Replace("#", "\\#"))
        //                            .ClientGroupFooterTemplate("Σ: #= kendo.format('{0:N}', sum)#".Replace("#", "\\#"));
        //                    }
        //                }
        //                if (propertyInfo.PropertyType == typeof(DateTime) ||
        //                    propertyInfo.PropertyType == typeof(DateTime?))
        //                {
        //                    GridBoundColumnBuilder<T> bldr = columns.Bound(propertyInfo.Name);
        //                    if (propertyInfo.Name.Equals("ModifiedDate", StringComparison.InvariantCultureIgnoreCase))
        //                    {
        //                        bldr = bldr.Title("Mdf. Date");
        //                    }

        //                    if (!isClient)
        //                    {
        //                        if (propertyInfo.Name.Equals("ModifiedDate", StringComparison.InvariantCultureIgnoreCase))
        //                        {
        //                            bldr
        //                                .Format(!string.IsNullOrEmpty(customFormat)
        //                                    ? customFormat
        //                                    : "{0:dd/MM/yyyy HH:mm:ss}")
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                        }
        //                        else
        //                        {
        //                            bldr
        //                                .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:dd/MM/yyyy}")
        //                                .EditorTemplateName("Date")
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#")
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#");
        //                        }
        //                    }
        //                    else
        //                    {
        //                        if (propertyInfo.Name.Equals("ModifiedDate", StringComparison.InvariantCultureIgnoreCase))
        //                        {
        //                            bldr
        //                                .Format(!string.IsNullOrEmpty(customFormat)
        //                                    ? customFormat
        //                                    : "{0:dd/MM/yyyy HH:mm:ss}")
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                    "\\#"));
        //                        }
        //                        else
        //                        {
        //                            bldr
        //                                .Format(!string.IsNullOrEmpty(customFormat) ? customFormat : "{0:dd/MM/yyyy}")
        //                                .EditorTemplateName("Date")
        //                                .ClientFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#", "\\#"))
        //                                .ClientGroupFooterTemplate("CT: #= kendo.format('{0}', count)#".Replace("#",
        //                                    "\\#"));
        //                        }
        //                    }
        //                }
        //            }

        //            if (isDeleteColumnVisible || isEditColumnVisible || isSelectColumnVisible)
        //            {
        //                columns.Command(command =>
        //                {
        //                    if (isDeleteColumnVisible)
        //                    {
        //                        command.Destroy().Text("Delete");
        //                    }
        //                    if (isEditColumnVisible)
        //                    {
        //                        command.Edit().Text("Edit");
        //                    }
        //                    if (isSelectColumnVisible)
        //                    {
        //                        command.Select().Text("Select");
        //                    }
        //                }); //.ClientFooterTemplate("Delete");
        //            }
        //        });
        //    return builder;
        //}

        //public static GridBuilder<T> AddDataSourceOptions<T>(this GridBuilder<T> builder, bool isBatch = true)
        //    where T : class
        //{
        //    Type modelEntityType = typeof(T);
        //    PropertyInfo[] modelEntityProperties = modelEntityType.GetProperties();

        //    PropertyInfo idPropertyInfo =
        //        modelEntityProperties.FirstOrDefault(pi => pi.GetCustomAttributes<KeyAttribute>().Any());
        //    if (idPropertyInfo == null)
        //    {
        //        throw new ApplicationException(string.Format(
        //            "The entity {0} does not have a key. You should add a KeyAttribute to a property to denote it as a primary key!",
        //            modelEntityType.FullName));
        //    }

        //    string idName = idPropertyInfo.Name;
        //    builder
        //        .DataSource(dataSource => dataSource
        //            .Ajax()
        //            .Batch(isBatch)
        //            .PageSize(5)
        //            .Model(
        //                model =>
        //                {
        //                    model.Id(idName);
        //                    model.Field(idName, typeof(int)).Editable(false);
        //                    model.Field("ModifiedDate", typeof(DateTime?)).Editable(false);
        //                    model.Field("ModifiedByUser", typeof(string)).Editable(false);
        //                    foreach (PropertyInfo propertyInfo in modelEntityProperties)
        //                    {
        //                        if (propertyInfo.Name != idName && propertyInfo.Name != "ModifiedDate" &&
        //                            propertyInfo.Name != "ModifiedByUser")
        //                        {
        //                            model.Field(propertyInfo.Name, propertyInfo.PropertyType)
        //                                .DefaultValue(GetDefaultValueForType(propertyInfo.PropertyType));
        //                        }
        //                        RelationAttribute rellAttribute =
        //                            propertyInfo.GetCustomAttributes<RelationAttribute>().FirstOrDefault();
        //                        if (rellAttribute != null)
        //                        {
        //                            model.Field(propertyInfo.Name, propertyInfo.PropertyType).DefaultValue(-1);
        //                            IEnumerator enumerator =
        //                                ContextFactory.Current.Set(rellAttribute.EntityType)
        //                                    .AsQueryable()
        //                                    .GetEnumerator();
        //                            if (enumerator.MoveNext())
        //                            {
        //                                var obj = enumerator.Current;
        //                                if (obj != null)
        //                                {
        //                                    Type objType = obj.GetType();
        //                                    PropertyInfo pi = objType.GetProperty(rellAttribute.DataFieldValue);
        //                                    if (pi != null)
        //                                    {
        //                                        object val = pi.GetValue(obj);
        //                                        model.Field(propertyInfo.Name, propertyInfo.PropertyType)
        //                                            .DefaultValue(val);
        //                                    }
        //                                }
        //                            }
        //                        }
        //                    }
        //                }
        //            )
        //            .Sort(sd =>
        //            {
        //                // Just show default dorting
        //                //sd.Add(idName).Ascending(); 
        //            })


        //            // this is for editing and deleting
        //            .Aggregates(a =>
        //            {
        //                Type[] numericTypes = new Type[]
        //                {
        //                    typeof (int), typeof (int?), typeof (double), typeof (double?), typeof (float),
        //                    typeof (float?),
        //                    typeof (decimal), typeof (decimal?)
        //                };
        //                foreach (PropertyInfo pi in modelEntityProperties)
        //                {
        //                    if (numericTypes.Contains(pi.PropertyType))
        //                    {
        //                        a.Add(pi.Name, pi.PropertyType).Average().Count().Max().Min().Sum();
        //                    }
        //                    else
        //                    {
        //                        a.Add(pi.Name, pi.PropertyType).Count();
        //                    }
        //                }
        //            })
        //            .ServerOperation(false) // This must be false so aggregates can appear.
        //            .Events(events => events.Error("onKendoGridDataSourceError")));
        //    return builder;
        //}

        //public static GridBuilder<T> AddDefaultOptions<T>(this GridBuilder<T> builder, bool isClient = false,
        //    bool showHiddenColumns = false, bool isCreateVisible = true)
        //    where T : class
        //{
        //    builder
        //        .Events(ev => ev.Save("onKendoGridSave").SaveChanges("onKendoGridSaveChanges").Remove("onKendoGridRemove"))
        //        .AddBaseOptions()
        //        .Editable(editable => editable.Mode(GridEditMode.InCell))
        //        .AddToolbarOptions(isCreateVisible)
        //        .AddColumnOptions(isClient, true, false, false, showHiddenColumns)
        //        .AddDataSourceOptions();
        //    return builder;
        //}

        //public static GridBuilder<T> AddDefaultOptionsPopUpEdit<T>(this GridBuilder<T> builder) where T : class
        //{
        //    builder
        //        // THIS WILL BE FOR SIGNAL R
        //        //.Events(ev => ev.SaveChanges("saveChanges"))
        //        .AddBaseOptions()
        //        .Editable(editable => editable.Mode(GridEditMode.PopUp))
        //        .AddToolbarOptions(true, true)
        //        .AddColumnOptions(true, false, false)
        //        .AddDataSourceOptions(false);

        //    return builder;
        //}

        //private static object GetDefaultValueForType(Type t)
        //{
        //    if (t == typeof(DateTime) || t == typeof(DateTime?))
        //    {
        //        return DateTime.Now;
        //    }

        //    Type baseType = Nullable.GetUnderlyingType(t);
        //    if (baseType != null)
        //    {
        //        return Activator.CreateInstance(baseType);
        //    }
        //    if (t.IsValueType)
        //    {
        //        return Activator.CreateInstance(t);
        //    }
        //    return null;
        //}
    }
}