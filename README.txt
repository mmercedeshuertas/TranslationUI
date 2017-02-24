--------------------------------------------------
------------------  AIM  -------------------------
-------------------------------------------------- 
the aim of this code is to support the translation of linguistic WordNet-like concepts.
Every concept is composed of language elements.
A concept to be translated (source concept) should have:
	Sense rank
	Lemma
	Exceptional forms
	Part of Speech (POS)
	Gloss
	Example
Internally every object to be translated should have an Id so that the different language concepts 
can be identified.

Every concept can have a translation into another language or not (target concept). If there is a translation, the 
following information should be provided:
	Lemma
	Exceptional forms
	Part od Speech
	Gloss
	Examples
When there is not a translation, the following elements should be provided:
	Gloss 
	Example

The target concept (translated concept) should be identified with an id and be linked somehow with the source concept (original concept).

Once the translation is completed, the submit button should sent the translation to a data base so that it 
can be stored.


--------------------------------------------------
--------------  FUNCTIONING  ---------------------
-------------------------------------------------- 

To see the code, you can open the html file in Sublime or any other text editor.
To run/visualize the interface, click on the Translation_Application.htlm file and it will open 
in your navigator.

NOTE:

This part of code is part of a bigger projects and has been used with angularjs, nodejs and mongodb