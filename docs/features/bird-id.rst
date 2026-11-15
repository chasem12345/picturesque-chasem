Bird ID
=======

Bird ID suggests the species of a bird in a photo, on your computer, with
the WingCLIP-0.3 model (:doc:`ADR-0018
</architecture/decisions/0018-bird-id-and-non-commercial-models>`).

Setting up
----------

1. In **Settings → AI models**, download **WingCLIP-0.3 bird identifier**
   (79 MB). Its license is CC BY-NC 4.0: non-commercial use only.
2. Optionally, in **Settings → Bird ID**, enter an eBird region code (``US``,
   ``US-WA``, ``US-WA-033``; find yours on ebird.org/explore) and a free
   eBird API key (ebird.org/api/keygen), save, and press **Get the region's
   species**. Suggestions are then limited to the birds eBird lists for the
   region. Without a region, every one of the model's 11,167 species can be
   suggested.

Identifying a bird
------------------

In the full-screen view, press :kbd:`D` (or **Bird ID**) and drag a box
around the bird. The five most likely species appear with how sure the
model is. Click one to name the photo; in a stack, **Name all photos of the
stack** (on by default) names every frame. With a region set, the closest
match outside the region is mentioned when it differs (a rare visitor, or a
wrong guess).

The species shows in the info panel and in the **Up next** list of stacks.
**Remove** forgets it.

Limits
------

- The model always names a bird, even when the box holds none.
- Accuracy is measured on North American birds; elsewhere it is less
  certain.
- A low confidence usually means similar species, not a bad box.
