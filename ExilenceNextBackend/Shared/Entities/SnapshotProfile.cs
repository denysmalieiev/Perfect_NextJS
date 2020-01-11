﻿using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text;

namespace Shared.Entities
{
    public class SnapshotProfile
    {
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        [Required, StringLength(50)]
        public string ClientId { get; set; }
        public string Name { get; set; }
        public string ActiveLeagueId { get; set; }
        public string ActivePriceLeagueId { get; set; }
        public bool Active { get; set; }
        public ICollection<string> ActiveStashTabIds { get; set; }
        public virtual ICollection<Snapshot> Snapshots { get; set; }
        [Key, DatabaseGenerated(DatabaseGeneratedOption.Computed)]

        [Required]
        public virtual Account Account { get; set; }
    }
}
