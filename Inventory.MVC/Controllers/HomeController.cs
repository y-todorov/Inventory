using Inventory.DAL;
using Inventory.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Controllers
{
    public class HomeController : Controller
    {
        public JsonResult Search(InventoryContext context, string searchText)
        {
            if (!string.IsNullOrWhiteSpace(searchText))
            {
                List<Product> prods = context.Products.FullTextSearch(searchText).ToList();
                List<Element> elem = context.Elements.FullTextSearch(searchText).ToList();

                List<EntityBase> result = prods.Concat<EntityBase>(elem).ToList();

                var res = result.Select(eb => new SearchViewModel
                {
                    EntityId = eb.Id,
                    EntityName = eb.GetType().Name,
                    EntityToString = eb.ToString()

                }).ToList();
                
                return Json(res, JsonRequestBehavior.AllowGet);
            }
            return null;
        }

        public ActionResult Index()
        {
            return View();
        }
 
    }
}