const colorSet = [
  {color: "black"},
  {color: "darkslategrey"},
  {color: "dimgrey"},
  {color: "grey"},
  {color: "lightgrey"},
  {color: "beige"},
  {color: "white"},
  {color: "maroon"},
  {color: "saddlebrown"},
  {color: "darkgoldenrod"},
  {color: "goldenrod"},
  {color: "rosybrown"},
  {color: "wheat"},
  {color: "navy"},
  {color: "blue"},
  {color: "dodgerblue"},
  {color: "deepskyblue"},
  {color: "aquamarine"},
  {color: "cyan"},
  {color: "olive"},
  {color: "darkgreen"},
  {color: "green"},
  {color: "springgreen"},
  {color: "limegreen"},
  {color: "palegreen"},
  {color: "lime"},
  {color: "greenyellow"},
  {color: "darkslateblue"},
  {color: "slateblue"},
  {color: "purple"},
  {color: "fuchsia"},
  {color: "plum"},
  {color: "orchid"},
  {color: "lavender"},
  {color: "darkkhaki"},
  {color: "khaki"},
  {color: "lemonchiffon"},
  {color: "yellow"},
  {color: "gold"},
  {color: "orangered"},
  {color: "orange"},
  {color: "coral"},
  {color: "lightpink"},
  {color: "palevioletred"},
  {color: "deeppink"},
  {color: "darkred"},
  {color: "crimson"},
  {color: "red"}       
];

function mySettings(props) {
  return (
    <Page>
      <Section title={<Text bold align="center">Background Color</Text>}>
        <ColorSelect
          settingsKey="accentColor"
          colors={colorSet}
        />
      </Section>
      <Section title={<Text bold align="center">Main Color</Text>}>
        <ColorSelect
          settingsKey="markerColor"
          colors={colorSet}
        />
      </Section>
      <Section title={<Text bold align="center">Watch Hands Opacity</Text>}>
          <Slider
            label="Invisible - Opaque"
            settingsKey="handsOpacity"
            min="0.0"
            max="1.0"
            step="0.25"
          />
      </Section>
      <Section>
        <Toggle
          settingsKey="showBackgroundGradient"
          label="Show Background Gradient"
        />
      </Section>
    </Page>
  );
}

registerSettingsPage(mySettings);
