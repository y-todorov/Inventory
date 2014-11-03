using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Controllers
{
    public class CodeController : Controller
    {
        public ActionResult BarCode()
        {
            return View();
        }

        public ActionResult QrCode()
        {
            return View();
        }

    }
}