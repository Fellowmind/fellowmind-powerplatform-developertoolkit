using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ExecuteHttpTrigger.Models
{
    public class MessageObject
    {
        public string message { get; set; }
        public bool success { get; set; }

        public string tablename { get; set; }

        public string recordid { get; set; }

    }
}
