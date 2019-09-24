BG=white
ALL = \
    ../static/icon.svg \
    ../static/favicon.ico \
    ../static/icon-apple-512.png \
    ../static/icon-32.png \
    ../static/icon-192.png \
    ../static/icon-512.png \
    ../static/icon-maskable.svg \
    ../static/icon-maskable-32.png \
    ../static/icon-maskable-192.png \
    ../static/icon-maskable-512.png \
    ../static/images/toilet.svg \
    ../static/images/person.svg
SVGO=svgo --disable=removeViewBox

.DELETE_ON_ERROR:

all: $(ALL)

../static/images/toilet.svg: toilet.svg
	$(SVGO) $< -o $@

../static/images/person.svg: person.svg
	$(SVGO) $< -o $@

tmp.%-transparent.svg: %.svg
	sed 's/#ff00ff/none/g' $< > $@

tmp.%-background.svg: %.svg
	sed 's/#ff00ff/$(BG)/g' $< > $@

../static/icon-apple-512.png: tmp.icon-apple-background.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%-maskable.svg: tmp.%-maskable-background.svg
	$(SVGO) $< -o $@

../static/%-maskable-32.png: tmp.%-maskable-background.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%-maskable-192.png: tmp.%-maskable-background.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%-maskable-512.png: tmp.%-maskable-background.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%.svg: tmp.%-transparent.svg
	$(SVGO) $< -o $@

../static/favicon.ico: favicon.svg
	convert -background none -density 600 -resize 32x $< $@

../static/%-32.png: favicon.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%-192.png: tmp.%-transparent.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

../static/%-512.png: tmp.%-transparent.svg
	convert -background none -density 600 -resize $$( basename "$@" .png | grep -Eo '[0-9]+$$' )x $< $@
	trimage -f $@

.PHONY: clean
clean:
	-rm -v $(ALL)
	-rm tmp.*.svg
