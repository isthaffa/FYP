import React, { useState } from 'react';
import PropTypes from 'prop-types';

import NavBar from './components/NavBar';

import LetterOne from './assets/letters/letter1.png';
import LetterTwo from './assets/letters/letter2.png';
import LetterThree from './assets/letters/letter3.png';
import LetterFive from './assets/letters/letter5.png';
import LetterSix from './assets/letters/letter6.png';
import LetterEleven from './assets/letters/letter11.png';
import LetterTwelve from './assets/letters/letter12.png';
import LetterSeven from './assets/letters/letter7.png';
import LetterEight from './assets/letters/letter8.png';
import LetterNine from './assets/letters/letter9.png';
import LetterTen from './assets/letters/letter10.png';
import LetterThirteen from './assets/letters/letter13.png';
import LetterFourteen from './assets/letters/letter14.png';
import LetterSixteen from './assets/letters/letter16.png';
import LetterTwentyFour from './assets/letters/letter24.png';

import LetterList from './assets/images/letters_list.jpg';

const containerStyles = {
  display: 'grid',
  gridTemplateColumns: 'repeat(6, 100px)',
  gridGap: '10px',
  padding: '20px',
};

const letterStyles = {
  fontSize: '24px',
  textAlign: 'center',
  cursor: 'pointer',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '10px',
};

const highlightedLetterStyles = {
  ...letterStyles,
  backgroundColor: '#3399FF', // Change the background color when highlighted
  color: '#fff', // Change the text color when highlighted
};

const letters = [
  { letter: 'අ', image: LetterOne },
  { letter: 'ආ', image: LetterTwo },
  { letter: 'ඇ', image: LetterThree },
  { letter: 'ඉ', image: LetterFive },
  { letter: 'ඊ', image: LetterSix },
  { letter: 'ඔ', image: LetterEleven },
  { letter: 'ඕ', image: LetterTwelve },
  { letter: 'උ', image: LetterSeven },
  { letter: 'ඌ', image: LetterEight },
  { letter: 'එ', image: LetterNine },
  { letter: 'ඒ', image: LetterTen },
  { letter: 'ක්', image: LetterThirteen },
  { letter: 'ග්', image: LetterFourteen },
  { letter: 'ථ', image: LetterSixteen },
  { letter: 'ම්', image: LetterTwentyFour },
];

function Learning(props) {
  const [previewImage, setPreviewImage] = useState(LetterOne);

  const handleLetterHover = (image) => {
    setPreviewImage(image);
  };

  return (
    <>
      <NavBar />
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
          paddingBottom: 100,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          {previewImage && (
            <div style={{ padding: 10, marginTop: 20 }}>
              <div style={{ padding: 10, border: '1px solid #3399FF' }}>
                <img
                  src={previewImage}
                  alt="Preview"
                  width={300}
                  height={300}
                />
              </div>
            </div>
          )}
          <br />
          <div style={containerStyles}>
            <br />
            {letters.map(({ letter, image }) => (
              <div
                key={letter}
                style={
                  previewImage === image
                    ? highlightedLetterStyles
                    : letterStyles
                }
                onMouseEnter={() => handleLetterHover(image)}
              >
                {letter}
              </div>
            ))}
          </div>
        </div>
        <h2>Sinhala Sign Table</h2>
        <br />
        <img
          src={LetterList}
          alt="Sinhala Letter List"
          width={500}
          height={500}
        />
      </div>
    </>
  );
}

Learning.propTypes = {};

export default Learning;
