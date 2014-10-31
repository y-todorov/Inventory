using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.UI;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Inventory.DAL;
using Inventory.MVC.Models;
using Inventory.MVC.Resources;
using Kendo.Mvc.Extensions;
using Kendo.Mvc.UI;

namespace Inventory.MVC.Controllers
{
    public class ProductController : ControllerBase
    {
        //http://demos.telerik.com/aspnet-mvc/grid/editing-popup Proèti me!
        //[OutputCache(Duration=600, Location= OutputCacheLocation.ServerAndClient)]
        public ActionResult Index()
        {
            return View(); 
        }

        public ActionResult Read([DataSourceRequest] DataSourceRequest request, InventoryContext context)
        {
            JsonResult result = ReadBase<Product, ProductViewModel>(request, context.Products).Result;
            return result;
        }


        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Create([DataSourceRequest] DataSourceRequest request, InventoryContext context, ProductViewModel productViewModel)
        {
            JsonResult result = CreateBase<Product, ProductViewModel>(request, context, productViewModel);
            return result;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Update([DataSourceRequest] DataSourceRequest request, InventoryContext context, ProductViewModel productViewModel)
        {
            JsonResult result = UpdateBase<Product, ProductViewModel>(request, context, productViewModel);
            return result;
        }

        [AcceptVerbs(HttpVerbs.Post)]
        public ActionResult Destroy([DataSourceRequest] DataSourceRequest request, ProductViewModel products)
        {
            return null;
        }
        
    }
}