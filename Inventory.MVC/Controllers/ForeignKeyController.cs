using System;
using System.Collections.Generic;
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
        public async Task<ActionResult> ReadProductCategoryViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = await ReadBase<ProductCategory, ProductCategoryViewModel>(request, context.Elements.OfType<ProductCategory>());
            return result;
        }

        public async Task<ActionResult> ReadProductStoreViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = await ReadBase<ProductStore, ProductStoreViewModel>(request, context.Elements.OfType<ProductStore>());
            return result;
        }

        public async Task<ActionResult> ReadProductUnitMeasureViewModel([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result =  await ReadBase<ProductUnitMeasure, ProductUnitMeasureViewModel>(request, context.Elements.OfType<ProductUnitMeasure>());
            return result;
        }
    }
}