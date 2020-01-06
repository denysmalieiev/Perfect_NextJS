﻿using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json.Serialization;

namespace Shared.Models
{
    public class GroupModel
    {
        public int? Id { get; set; }
        [JsonPropertyName("uuid")]
        public string ClientId { get; set; }
        public string Name { get; set; }
        public string Password { get; set; }

        public List<ConnectionModel> Connections { get; set; }
        public List<SnapshotProfileModel> Profiles { get; set; }
        public DateTime? Created { get; set; }
    }
}
