using Inventory.DAL;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Controllers.ElementControllers
{
    public class TownController : ControllerBase
    {
       public ActionResult Details(int id, InventoryContext context)
       {
           var town = context.Elements.OfType<Town>().FirstOrDefault(t => t.Id == id);
           if (town != null)
           {
               return View(town);
           }
           else
           {
               return new HttpNotFoundResult("Не съществува град с Id=" + id);
           }
       }
    }
}