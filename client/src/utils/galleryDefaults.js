export const getTemplateGallery = (templateName) => {
 const galleries = {
 // Food & Beverage Templates (Crave, Bistro, Harvest, Brew, Slice, Hops)
 t4: [
 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&q=80',
 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=600&q=80',
 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?w=600&q=80',
 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80',
 'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?w=600&q=80',
 ],
 t10: [
 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?w=600&q=80',
 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80',
 'https://images.unsplash.com/photo-1495474472204-51ea0e201bb9?w=600&q=80',
 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=600&q=80',
 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=600&q=80',
 'https://images.unsplash.com/photo-1501339819938-b1a6d91cd4a9?w=600&q=80',
 ],
 t28: [
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
 'https://images.unsplash.com/photo-1608686207856-001b95cf60ca?w=600&q=80',
 'https://images.unsplash.com/photo-1506484381205-f7945653044d?w=600&q=80',
 'https://images.unsplash.com/photo-1596199050105-6d5d32222916?w=600&q=80',
 'https://images.unsplash.com/photo-1543168256-4154204e30f1?w=600&q=80',
 'https://images.unsplash.com/photo-1588195538326-c5b1e9f80a1b?w=600&q=80',
 ],
 // Beauty & Wellness Templates (Bloom, Glow, Flora, Onyx, Mist, Petal)
 t3: [
 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&q=80',
 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80',
 'https://images.unsplash.com/photo-1512496015851-a1c8dcbc6fb6?w=600&q=80',
 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&q=80',
 'https://images.unsplash.com/photo-1570554886111-e80fcca6a029?w=600&q=80',
 'https://images.unsplash.com/photo-1616394584738-fc6e612e71c9?w=600&q=80',
 ],
 t15: [
 'https://images.unsplash.com/photo-1526047932273-341f2a7631f9?w=600&q=80',
 'https://images.unsplash.com/photo-1490750967868-88cb4ece7046?w=600&q=80',
 'https://images.unsplash.com/photo-1457089328109-e5d9bd49f563?w=600&q=80',
 'https://images.unsplash.com/photo-1487070183336-b863922373d4?w=600&q=80',
 'https://images.unsplash.com/photo-1436891620584-47fd0e565afb?w=600&q=80',
 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=600&q=80',
 ],
 // Fashion Templates (Aurora, Vogue, Trend, Silk, Active, Vintage)
 t1: [
 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=600&q=80',
 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600&q=80',
 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=600&q=80',
 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&q=80',
 'https://images.unsplash.com/photo-1485230895905-efdb65c696e3?w=600&q=80',
 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=600&q=80',
 ],
 t7: [
 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=600&q=80',
 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=600&q=80',
 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=600&q=80',
 'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=600&q=80',
 'https://images.unsplash.com/photo-1507702553912-a15641eeb615?w=600&q=80',
 'https://images.unsplash.com/photo-1462392246754-28dfa2df8e6b?w=600&q=80',
 ],
 // Electronics / Tech (Slate, Pixel, Spark, Quantum, Aero, RetroTech)
 t2: [
 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=600&q=80',
 'https://images.unsplash.com/photo-1484788984921-03950022c9ef?w=600&q=80',
 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80',
 'https://images.unsplash.com/photo-1527443195645-1133f7f28990?w=600&q=80',
 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?w=600&q=80',
 'https://images.unsplash.com/photo-1537498425277-c283d32ef9db?w=600&q=80',
 ],
 // Home Decor (Haven, Loft, Manor, Patio, Urban, Zen)
 t5: [
 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=600&q=80',
 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=600&q=80',
 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&q=80',
 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&q=80',
 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=600&q=80',
 'https://images.unsplash.com/photo-1616486029423-aaa4789e8c9a?w=600&q=80',
 ],
 // Services / Mechanic (Pulse, Nexus, Zenith, Scale, PixelCraft, Care)
 t33: [
 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&q=80',
 'https://images.unsplash.com/photo-1565043589221-b3846c878ab4?w=600&q=80',
 'https://images.unsplash.com/photo-1503375894314-476722bf25f5?w=600&q=80',
 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=600&q=80',
 'https://images.unsplash.com/photo-1530906358829-e84b2769270f?w=600&q=80',
 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=600&q=80',
 ],
 };

 // Assign categories to their general defaults
 galleries['t26'] = galleries['t4']; // Slice uses Crave default
 galleries['t27'] = galleries['t4']; // Hops uses Crave default
 galleries['t25'] = galleries['t10']; // Brew uses Bistro default
 
 galleries['t13'] = galleries['t1']; // Trend uses Aurora default
 galleries['t16'] = galleries['t1']; // Silk uses Aurora default
 galleries['t17'] = galleries['t1']; // Active uses Aurora default
 galleries['t18'] = galleries['t1']; // Vintage uses Aurora default

 galleries['t8'] = galleries['t2']; // Pixel uses Slate default
 galleries['t14'] = galleries['t2']; // Spark uses Slate default
 galleries['t19'] = galleries['t2']; // Quantum uses Slate default
 galleries['t20'] = galleries['t2']; // Aero uses Slate default
 galleries['t21'] = galleries['t2']; // RetroTech uses Slate default

 galleries['t9'] = galleries['t3']; // Glow uses Bloom default
 galleries['t22'] = galleries['t3']; // Onyx uses Bloom default
 galleries['t23'] = galleries['t3']; // Mist uses Bloom default
 galleries['t24'] = galleries['t3']; // Petal uses Bloom default

 galleries['t11'] = galleries['t5']; // Loft uses Haven default
 galleries['t29'] = galleries['t5']; // Manor uses Haven default
 galleries['t30'] = galleries['t5']; // Patio uses Haven default
 galleries['t31'] = galleries['t5']; // Urban uses Haven default
 galleries['t32'] = galleries['t5']; // Zen uses Haven default

 galleries['t6'] = galleries['t33']; // Nexus uses Pulse default
 galleries['t12'] = galleries['t33']; // Zenith uses Pulse default
 galleries['t34'] = galleries['t33']; // Scale uses Pulse default
 galleries['t35'] = galleries['t33']; // PixelCraft uses Pulse default
 galleries['t36'] = galleries['t33']; // Care uses Pulse default

 // The existing generic default
 const fallback = [
 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&q=80',
 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=600&q=80',
 'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?w=600&q=80',
 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=600&q=80',
 'https://images.unsplash.com/photo-1563013544-824ae1d704d3?w=600&q=80'
 ];

 return galleries[templateName] || fallback;
};
