## Tests 

1 tests onlyOwner modifier
On verifie que les fonctions ne sont pas accessible par un utilisateur qui n'est pas le propriétaire du contrat

2 tests onlyVotersmodifier
On verifie que les fonctions ne sont pas accessible par un utilisateur qui n'est pas dans la liste des votants

3 tests workflow
On test ici que l'ordre des étapes est respecté
On test aussi les comportements "classiques" du vote :
    - cas normal
    - cas particulier où il y a égalité entre 2 propositions

J'avais commencé à utilisé truffleAssert, j'ai passé les tests avec la lib de openZeppelin (il en reste peut-être avec truffleassert).
 Je préfère truffleAssert : il dit quel est la ligne où le test a échoué (alors que expectRevert ne dit pas où est le problème, ça peeut être compliqué le jour ou on modifie le smart contract et que plusieurs tests échouent)

 Est-ce qu'une des 2 lib est plus utilisée que l'autre ?