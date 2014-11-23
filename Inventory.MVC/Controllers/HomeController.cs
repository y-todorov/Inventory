using Inventory.DAL;
using Inventory.MVC.Models;
using Inventory.Utils;
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
                    EntityToString = eb.ToString(),
                    EntityUrl = HttpHelperUtils.GetBaseUrlPath() + GetRealTypeName(eb.GetType().Name) + "/Details/" + eb.Id


                }).ToList();
                
                return Json(res, JsonRequestBehavior.AllowGet);
            }
            return null;
        }

        private string GetRealTypeName(string typeName)
        {
            string result = typeName;
            if (typeName.Contains("_"))
            {
                int index = typeName.IndexOf("_");
                result = typeName.Substring(0, index);
            }
            return result;
        }

        public ActionResult Index()
        {
            return View();
        }
 
    }
}