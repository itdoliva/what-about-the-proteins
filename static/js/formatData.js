function formatData(raw, scales) {
  const children = d3.groups(raw, d => d.domain, d => d.group)
    .map(domainArr => {
      const [ domainName, domainG ] = domainArr;
      const domain = domainName.toLowerCase()
      const children = domainG.map(groupArr => {
        const [ groupName, groupG ] = groupArr
        const children = groupG.map(d => ({ 
          ...d,
          carbohydrateLeaf: new Leaf(scales.carbohydrate(d.carbohydrate)),
          lipidLeaf: new Leaf(scales.lipid(d.lipid)),
          domain
        }))

        return { name: groupName, category: 'group', children, domain } // depth 2
      })
      return { name: domainName, category: 'domain', children, domain } // depth 1
    })

    return { 
      name: 'root', 
      category: 'root',
      children
    }
}