using Inventory.MVC.Attributes;
using Inventory.MVC.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Controllers
{
    public class PartialController : Controller
    {
        // GET: Partial [AbstractBind(ConcreteTypeParameter = "Inventory.MVC.Models.TownViewModel")]
        public ActionResult CommonDataPartial(TownViewModel model)
        {
            return PartialView(model);
        }


    }
}