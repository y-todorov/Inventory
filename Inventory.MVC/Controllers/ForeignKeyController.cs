using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Linq;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using AutoMapper.QueryableExtensions;
using Inventory.DAL;
using Inventory.MVC.Models;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;

namespace Inventory.MVC.Controllers
{
    public class ForeignKeyController : ControllerBase
    {
        public ActionResult ReadProductCategoryViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = ReadBase<ProductCategory, ProductCategoryViewModel>(request, context.Elements.OfType<ProductCategory>());
            return result;
        }

        public ActionResult ReadProductStoreViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = ReadBase<ProductStore, ProductStoreViewModel>(request, context.Elements.OfType<ProductStore>());
            return result;
        }

        public ActionResult ReadProductUnitMeasureViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result =  ReadBase<ProductUnitMeasure, ProductUnitMeasureViewModel>(request, context.Elements.OfType<ProductUnitMeasure>());
            return result;
        }

        public IEnumerable<ProductCategoryViewModel> ReadAllCategories()
        {
            using (InventoryContext context = new InventoryContext())
            {
                var list = context.Elements.OfType<ProductCategory>().ToList();
                var viewModels = list.AsQueryable().Project().To<ProductCategoryViewModel>();
                return viewModels;
            }
        }
    }
}