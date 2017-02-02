require 'spec_helper'

RSpec::Matchers.define :match_valid_value do |expected|
  match do |actual|
    section, column, metric = actual.split(' ').map!(&:downcase)
    @found = find("##{section}").find("##{metric}").find(".#{column}-mark").find('.mark-text').text
    values_match?(expected, @found)
  end
  failure_message do |actual|
    "expected that #{actual} value would be '#{expected}', but was '#{@found}'"
  end
end

RSpec.describe 'Show page', type: :feature do
  before(:each) do
    visit "/#{@b_project}"
  end

  context 'when browse Maintenance section' do
    before { find('#maintenance').find('.gem-stats__toggler').click }
    context 'Maintenance Total life_period' do
      it { is_expected.to match_valid_value("2+ years B") }
    end

    context 'Maintenance Total commits_count_since_last_release_count' do
      it { is_expected.to match_valid_value("27 A") }
    end

    context 'Maintenance Total issues_processed_in_avg' do
      it { is_expected.to match_valid_value("~1 month C") }
    end

    context 'Maintenance Total issues_processed_in_median' do
      it { is_expected.to match_valid_value("~4 days A") }
    end

    context 'Maintenance Total issues_all_count' do
      it { is_expected.to match_valid_value("68 B") }
    end

    context 'Maintenance Total issues_closed_percent' do
      it { is_expected.to match_valid_value("73% B") }
    end

    context 'Maintenance Total pr_processed_in_avg' do
      it { is_expected.to match_valid_value("~3 months E") }
    end

    context 'Maintenance Total pr_processed_in_median' do
      it { is_expected.to match_valid_value("~1 month D") }
    end

    context 'Maintenance Total pr_all_count' do
      it { is_expected.to match_valid_value("104 A") }
    end

    context 'Maintenance Total pr_closed_percent' do
      it { is_expected.to match_valid_value("95% A") }
    end

    it do
      # save_screenshot('./tmp/screen1.png', :full => true)
      find('#maintenance').assert_selector('.gems-stats-table__cell_title', :count => 25)
      expect(find('#maintenance').find('.gem-stats__mark').find('use')['xlink:href']).to eq('#icon_type_mark-b')
    end
  end

  context 'when browse Popularity section' do
    before { find('#popularity').find('.gem-stats__toggler').click }
    context 'Popularity Total users_creating_issues_count' do
      it { is_expected.to match_valid_value("62 B") }
    end

    context 'Popularity Total users_commenting_issues_count' do
      it { is_expected.to match_valid_value("71 B") }
    end

    context 'Popularity Total users_creating_pr_count' do
      it { is_expected.to match_valid_value("64 A") }
    end

    context 'Popularity Total users_commenting_pr_count' do
      it { is_expected.to match_valid_value("42 B") }
    end

    context 'Popularity Total stargazers_count' do
      it { is_expected.to match_valid_value("764 A") }
    end

    context 'Popularity Total forks_count' do
      it { is_expected.to match_valid_value("375 A") }
    end

    context 'Popularity Total forks_count' do
      it { is_expected.to match_valid_value("375 A") }
    end

    context 'Popularity Total users_involved_count' do
      it { is_expected.to match_valid_value("1256 A") }
    end

    context 'Popularity Total users_involved_no_stars_count' do
      it { is_expected.to match_valid_value("492 A") }
    end

    context 'Popularity Total total_downloads_count' do
      it { is_expected.to match_valid_value("123,254,906 A") }
    end

    context 'Popularity Total dependants_count' do
      it { is_expected.to match_valid_value("52391 A") }
    end

    context 'Popularity Total contributors_count' do
      it { is_expected.to match_valid_value("153 A") }
    end

    context 'Popularity Total watchers_count' do
      it { is_expected.to match_valid_value("46 A") }
    end

    context 'Popularity Total questions_count' do
      it { is_expected.to match_valid_value("5269 A") }
    end

    context 'Popularity Total questions_resolved_percent' do
      it { is_expected.to match_valid_value("56% A") }
    end

    it do
      find('#popularity').assert_selector('.gems-stats-table__cell_title', :count => 20)
      expect(find('#popularity').find('.gem-stats__mark').find('use')['xlink:href']).to eq('#icon_type_mark-a')
    end
  end

  context 'when browse Maturity section' do
    before { find('#maturity').find('.gem-stats__toggler').click }
    context 'Maturity Total life_period' do
      it { is_expected.to match_valid_value("2+ years B") }
    end

    context 'Maturity Total issues_processed_in_avg' do
      it { is_expected.to match_valid_value("~1 month C") }
    end

    context 'Maturity Total issues_processed_in_median' do
      it { is_expected.to match_valid_value("~4 days A") }
    end

    context 'Maturity Total issues_all_count' do
      it { is_expected.to match_valid_value("68 B") }
    end

    context 'Maturity Total issues_closed_percent' do
      it { is_expected.to match_valid_value("73% B") }
    end

    context 'Maturity Total pr_processed_in_avg' do
      it { is_expected.to match_valid_value("~3 months E") }
    end

    context 'Maturity Total pr_processed_in_median' do
      it { is_expected.to match_valid_value("~1 month D") }
    end

    context 'Maturity Total pr_all_count' do
      it { is_expected.to match_valid_value("104 A") }
    end

    context 'Maturity Total pr_closed_percent' do
      it { is_expected.to match_valid_value("95% A") }
    end

    context 'Maturity Total users_creating_issues_count' do
      it { is_expected.to match_valid_value("62 B") }
    end

    context 'Maturity Total users_commenting_issues_count' do
      it { is_expected.to match_valid_value("71 B") }
    end

    context 'Maturity Total users_creating_pr_count' do
      it { is_expected.to match_valid_value("64 A") }
    end

    context 'Maturity Total users_commenting_pr_count' do
      it { is_expected.to match_valid_value("42 B") }
    end

    context 'Maturity Total stargazers_count' do
      it { is_expected.to match_valid_value("764 A") }
    end

    context 'Maturity Total forks_count' do
      it { is_expected.to match_valid_value("375 A") }
    end

    context 'Maturity Total forks_count' do
      it { is_expected.to match_valid_value("375 A") }
    end

    context 'Maturity Total users_involved_count' do
      it { is_expected.to match_valid_value("1256 A") }
    end

    context 'Maturity Total users_involved_no_stars_count' do
      it { is_expected.to match_valid_value("492 A") }
    end

    context 'Maturity Total total_downloads_count' do
      it { is_expected.to match_valid_value("123,254,906 A") }
    end

    context 'Maturity Total dependants_count' do
      it { is_expected.to match_valid_value("52391 A") }
    end

    context 'Maturity Total watchers_count' do
      it { is_expected.to match_valid_value("46 A") }
    end

    context 'Maturity Total questions_count' do
      it { is_expected.to match_valid_value("5269 A") }
    end

    context 'Maturity Total questions_resolved_percent' do
      it { is_expected.to match_valid_value("56% A") }
    end

    it do
      find('#maturity').assert_selector('.gems-stats-table__cell_title', :count => 30)
      expect(find('#popularity').find('.gem-stats__mark').find('use')['xlink:href']).to eq('#icon_type_mark-a')
    end
  end
end
