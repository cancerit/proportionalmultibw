# ProportionalMultiBw
JBrowse plugin to display multiple BigWig tracks as a stacked proportion of depth.

## Why?
Over the last few years it has been common to generate whole genome sequencing (WGS) data
around 30-50x deep.  Even standard whole exome sequencing (WXS) is rarely over 100x and
JBrowse can display these reasonably well.

Within our group we are more regularly carrying out amplicon sequencing experiments (targeted pulldown)
with depth in the 1000s causing visualisation of the profile of errors/mutations in a region difficult.

Even in WGS, due to the new XTen Illumina machines, more high depth experiments are being run to detect
improve sensitivity to subclonal events in cancer genomes.

## The plugin
This plugin is an adaptation of the [MultiBigWig](https://github.com/elsiklab/multibigwig) plugin.

It will provide a track type able to read a set of BigWig files and produce a stacked proportion bar
plot for each position.  The initial use case is similar to the 'allele tower' that was available in
GBrowse (I can't find an image that still links).  This would expect 4 BigWig files, one for each of
ACGT, and render a proportional stack of bars from most prevelant at the bottom to least prevelant at
the top (excluding any with value == 0).  It is anticipated that the track woule be used in conjunction
with a standard coverage XYPlot.
