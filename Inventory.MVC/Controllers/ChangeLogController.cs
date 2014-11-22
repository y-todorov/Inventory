using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace Inventory.MVC.Areas.Admin.Controllers
{
    public class ChangeLogController : Controller
    {
        // GET: Admin/ChangeLog
        public ActionResult Index()
        {
            return View();
        }
    }
}