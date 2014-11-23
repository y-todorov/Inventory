using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;

namespace Inventory.Utils
{
    public static class HttpHelperUtils
    {
        /// <summary>
        ///
        /// </summary>
        /// <returns>Returns result like http://inventory-11.apphb.com/ </returns>
        public static string GetBaseUrlPath()
        {
            string result = HttpContext.Current.Request.Url.Scheme + "://" + HttpContext.Current.Request.Url.Authority +
                            HttpContext.Current.Request.ApplicationPath;

            if (!result.EndsWith("/"))
            {
                result += "/";
            }
            

            return result;
        }
    }
}
